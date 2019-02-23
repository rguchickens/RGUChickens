import cv2
import numpy as np
import urllib.request

stream=urllib.request.urlopen('http://10.85.8.62:8081/')
byteList=bytes()
while True:
    byteList+=stream.read(1024)
    a = byteList.find(bytes([0xff,0xd8])) # JPEG start
    b = byteList.find(bytes([0xff,0xd9])) # JPEG end
    if a!=-1 and b!=-1:
        jpg = byteList[a:b+2] # actual image
        byteList= byteList[b+2:] # other informations

        # decode to colored image ( another option is cv2.IMREAD_GRAYSCALE )
        img = cv2.imdecode(np.fromstring(jpg, dtype=np.uint8),cv2.IMREAD_COLOR) 
        cv2.imshow('Window name',img) # display image while receiving data
        if cv2.waitKey(1) ==27: # if user hit esc
            exit(0) # exit program