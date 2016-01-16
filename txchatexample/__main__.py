import os.path
import sys

from twisted.internet import reactor
from twisted.python import log
from twisted.web.server import Site
from twisted.web.static import File
from twisted.web.proxy import ReverseProxyResource
from twisted.web.resource import Resource

from autobahn.twisted.resource import WebSocketResource
from autobahn.twisted.websocket import WebSocketServerFactory, WebSocketServerProtocol


class APIResource(Resource):
    def getChild(self, path, request):
        if path == 'ws':
            return WSResoure()
        else:
            raise NotImplementedError()


factory = WebSocketServerFactory()


class EchoServerProtocol(WebSocketServerProtocol):

    def onMessage(self, payload, isBinary):
        self.sendMessage(payload, isBinary)



factory.protocol = EchoServerProtocol
class MainResource(Resource):
    def __init__(self, static_path=None):
        if static_path is None:
             static_path = os.path.join(os.path.dirname(__file__), 'static')
        self._static_path = static_path
        Resource.__init__(self)

    def getChild(self, path, request):
        if path == 'api':
            return APIResource()
        elif path == 'ws':
            return WebSocketResource(factory)
        else:
            return ReverseProxyResource('127.0.0.1', 8080, os.path.join('/', path))
        if not path:
            return File(os.path.join(self._static_path, 'index.html'))

        return self


if __name__ == '__main__':
    print
    log.startLogging(sys.stdout)
    site = Site(MainResource())
    reactor.listenTCP(8000, site)
    reactor.run()