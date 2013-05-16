# The tcp client which will be used by raspberry pi to turn light bulbs on
__author__ = 'Greg Berger'

import socket
import gpioProcess




def tcp_serve():
    IP = "188.165.193.200"
    PORT = 33333
    BUFFER_SIZE = 20
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.connect((IP,PORT))
    print "Connected"
    while True:
        data = s.recv(BUFFER_SIZE)
        gpioProcess.processReceivedData(data)

    s.close()
    webServer.StreamHandler.close()


tcp_serve()





