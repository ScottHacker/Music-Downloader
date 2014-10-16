import os, os.path
import json
import random
import string

import cherrypy

class Downloader(object):
   @cherrypy.expose
   def index(self):
       return file('static/index.html')

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

         print "Artist: {0}, Title: {1}, Year: {2}".format(d['Artist'], d['Title'], d['Year'])
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
