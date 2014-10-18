import os, os.path
import json
import random
import string
import ConfigParser
import cherrypy

class Downloader(object):
   @cherrypy.expose
   def index(self):
      return file('static/index.html')

   @cherrypy.expose
   @cherrypy.tools.json_out()
   @cherrypy.tools.json_in()
   def config(self):
      conf_file = 'downloader.conf'
      conf_section = 'settings'
      parser = ConfigParser.SafeConfigParser()
      parser.read(conf_file)

      if cherrypy.request.method == 'POST':
         settings = cherrypy.request.json

         for candidate in settings.keys():
            if parser.has_option(conf_section, candidate):
               parser.set(conf_section, candidate, '"' + settings[candidate] + '"')

         with open(conf_file, 'wb') as f:
            parser.write(f)

      return json.dumps(parser._sections[conf_section])

   @cherrypy.expose
   @cherrypy.tools.json_in()
   def download(self):
      audio_format = "mp3"
      destination_path = "/media/readyshare/Music/"
      file_name = "{artist} - {title}"
      download_command = "youtube-dl -x --audio-format {format} '{url}' -o '{savepath}'"
      metadata_command = "--exec 'mp3info -t \"{title}\" -a \"{artist}\" -l \"{album}\" -g \"{genre}\" -y \"{year}\" -c \"{comments}\"'"

      try:
         d = cherrypy.request.json

         print "Artist: {0}, Title: {1}, Album: {2}, Year: {3}, Genre: {4}".format(d['Artist'], d['Title'], d['Album'], d['Year'], d['Genre'])
         print "Url: " + d['Url'];
         file = file_name.format(artist=d['Artist'], title=d['Title'], year=d['Year'])
         full_path = destination_path + file + ".%(ext)s"
         cmd = download_command.format(format=audio_format, url=d['Url'], savepath=full_path)
         cmd += " " +  metadata_command.format(title=d['Title'], artist=d['Artist'], album=d['Album'], genre=d['Genre'], year=d['Year'], comments="", filename=file, format=audio_format)
         print "Running command: " + cmd
         os.system(cmd)

      except (ValueError, KeyError, TypeError):
          print "JSON format error"


if __name__ == '__main__':
   cherrypy.quickstart(Downloader(), '/', 'downloader.conf')
