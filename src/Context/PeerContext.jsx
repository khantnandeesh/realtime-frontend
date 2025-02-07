import React, { createContext ,useCallback, useEffect, useRef, useState} from 'react'


export let PeerContext = createContext(null);


const PeerCont =React.memo( ({ children }) => {
    let [remS,setRms]=useState(null)
    
        const rtcConfig = {
            iceServers: [
                {
                    urls: [
                      "stun:stun.l.google.com:19302",
                      "stun:global.stun.twilio.com:3478",
                    ],
                  },
            ],
        };
        let peer = new RTCPeerConnection(rtcConfig);


        peer.onnegotiationneeded
  
        let handleTrackEvent=useCallback((ev)=>{
            console.log("plese hoja !");
            
           setRms( ev.streams);
        },[])

        useEffect(()=>{
            peer.addEventListener('track',handleTrackEvent)
           
            return ()=>{
                peer.removeEventListener('track',handleTrackEvent)
            }
        },[peer])

     
     
    const sendStreams =async function (stream) {
  
        if(stream){

            
            console.dir(stream)
            console.log('ended...');
               
                
            stream.getTracks().forEach(track =>{console.log("localStream sending!");
                     console.dir(peer);
                     
            peer.addTrack(track, stream)});

        }
         
               
    }
        
    

    const createOffer = async () => {
        const offer = await peer.createOffer()
        await peer.setLocalDescription(offer)
        console.log("OLD CREATED OFFER");
        
        return offer
    }

    const createAnswer=async(offer)=>{
        await peer.setRemoteDescription(offer)
        let answer=await peer.createAnswer()
        await peer.setLocalDescription(new RTCSessionDescription(answer))
        console.log("NEW CREATED ANS");
        
        return answer

    }


    const acceptAnswer=async(answer)=>{
        console.log("OLD received proposal");
        if (!peer.localDescription) {
            console.error("Local offer is not set. Cannot set remote answer.");
            return;
        }
        
   
      let a= await  peer.setRemoteDescription(answer)
      return a;

    }

    return (

        <PeerContext.Provider value={{peer,createOffer,createAnswer,acceptAnswer,sendStreams,remS}} >{children}</PeerContext.Provider>
     
    )
}
)
export default PeerCont;


