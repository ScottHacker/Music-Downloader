import os, os.path
import json
import random
import string
import ConfigParser
import cherrypy

supported_formats = ['mp3', 'ogg']
conf_file = 'downloader.conf'
conf_section = 'settings'



class Downloader(object):

   def formatInput(self, inputVal):
      return '"' + str(inputVal) + '"'

   def formatOutput(self, outputVal):
      return outputVal.lstrip('"').rstrip('"')

   def checkPathExists(self, path):
      return os.path.exists(self.formatOutput(path))

   @cherrypy.expose
   def index(self):
      return file('static/index.html')

   @cherrypy.expose
   @cherrypy.tools.json_out()
   @cherrypy.tools.json_in()
   def config(self):
      parser = ConfigParser.SafeConfigParser()
      parser.read(conf_file)

      if cherrypy.request.method == 'POST':
         settings = cherrypy.request.json

         # For each option in the Settings JSON object
         for option in settings.keys():
            if parser.has_option(conf_section, option):
               parser.set(conf_section, option, self.formatInput(settings[option]))

         with open(conf_file, 'wb') as f:
            parser.write(f)

      settings = parser._sections[conf_section]
      settings['supported_formats'] = supported_formats
      settings['found_path'] = self.checkPathExists(settings['download_path'])
      return json.dumps(settings)

   @cherrypy.expose
   @cherrypy.tools.json_in()
   @cherrypy.tools.json_out()
   def download(self):
      parser = ConfigParser.SafeConfigParser()
      parser.read(conf_file)

      audio_format = self.formatOutput(parser.get(conf_section, 'format'))
      destination_path = self.formatOutput(parser.get(conf_section, 'download_path'))
      file_name = self.formatOutput(parser.get(conf_section, 'file_name'))
      download_command = "youtube-dl -x --audio-format {format} '{url}' -o '{savepath}'"
      metadata_command = "--exec 'mp3info -f -t \"{title}\" -a \"{artist}\" -l \"{album}\" -g \"{genre}\" -y \"{year}\" -c \"{comments}\"'"

      response = {'Success':True, 'Message':'Download Successful'}

      try:
         d = cherrypy.request.json

         print "Artist: {0}, Title: {1}, Album: {2}, Year: {3}, Genre: {4}".format(d['Artist'], d['Title'], d['Album'], d['Year'], d['Genre'])
         print "Url: " + d['Url'];
         file = file_name.format(artist=d['Artist'], title=d['Title'], year=d['Year'])
         full_path = os.path.join(destination_path, file + ".%(ext)s")
         cmd = download_command.format(format=audio_format, url=d['Url'], savepath=full_path)
         cmd += " " +  metadata_command.format(title=d['Title'], artist=d['Artist'], album=d['Album'], genre=d['Genre'], year=d['Year'], comments="", filename=file, format=audio_format)
         print "Running command: " + cmd
         code = os.system(cmd)
         if code != 0:
            response['Success'] = False
            response['Message'] = 'Error running download command'

      except (ValueError, KeyError, TypeError):
          print "JSON format error"
          response['Success'] = False
          response['Message'] = 'JSON format error'
      return response


if __name__ == '__main__':
   cherrypy.quickstart(Downloader(), '/', 'downloader.conf')
