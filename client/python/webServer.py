__author__ = 'Greg Berger'
from twisted.web import server, resource
from twisted.internet import reactor

class Test(resource.Resource):
    isLeaf = True
    numberRequests = 0

    def render_GET(self, request):
        self.numberRequests = 1
        request.setHeader("Content-Type", "text/plain")
        return "Hello is it me you're looking for ?"

reactor.listenTCP(8080, server.Site(Test()))
reactor.run()

