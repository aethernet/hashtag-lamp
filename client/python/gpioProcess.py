__author__ = 'Greg Berger'
import re

def processReceivedData(data):
    dataList = data.partition('<')
    for a in dataList:
        if re.match(r'^\d+\|\d+$', a):
            print "raw data : ", a
            dataArr = a.partition('|');
            pinNr = dataArr[0]
            charNr = dataArr[2].rstrip('<')
            turnPinOn(pinNr, charNr)


def turnPinOn(pinNr, charNr):
    print "turning pin %(1)s on number of chars: %(2)s" % {"1": pinNr, "2":charNr}
    # do GPIO logic