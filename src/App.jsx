import { useContext, useEffect, useRef, useState,useCallback } from 'react'
import { useForm } from "react-hook-form";
import './App.css'
import Message from './Component/Message';
import { PeerContext } from './Context/PeerContext';

    import ReactPlayer from 'react-player'

function App() {

    const [activeP, setactiveP] = useState(!(localStorage.getItem("roomId") && localStorage.getItem("name")))
    let [name, setName] = useState(localStorage.getItem("name"))
    let [socket, setSocket] = useState({})
    let [roomId, setRoomId] = useState(localStorage.getItem("roomId"))
    let [chat, setChat] = useState([])
    let [msg, setM] = useState("")
    let [videoSocket,setVideoSocket]=useState(null)
    let inputRef = useRef();
    let divRef = useRef();
    let {peer,createOffer,createAnswer,acceptAnswer,sendStreams,remS}=useContext(PeerContext)
    let [connected,setConnected]=useState(false)
    let [selfS,setSelfS]=useState(null)
    // let [remS,setRemS]=useState(null)






    let setStream= async function (){
     navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream)=>{
        if(!selfS){
            sendStreams(stream)
        }
      
        setSelfS(stream)
       
    

     });
        
        

    }

       
         
    useEffect(() => {
        console.dir(peer);
        
        


      
        let real = (localStorage.getItem("roomId") != null && localStorage.getItem("name") != null);

        let socket = new WebSocket("wss://realtime-backend-y8hf.onrender.com")
       
        socket.onmessage = (e) => {


            let arre = JSON.parse(e.data)
            console.log("message from server", arre);

            if (arre.data) {
                console.log("here ");
                arre = arre.data
                console.log("to be inserted ", arre);

                setChat((arr) => {
                    console.log(arr, " inside setChat", [...arr, ...arre]);
                    return [...arr, ...arre]
                })


            } else {
                console.log("inside else");
                console.log("arre is ", arre);


                setChat((arr) => [...arr, arre])

            }



            if (real) {
                console.log("inside real!");

                let obj = {
                    type: "join",
                    payload: {
                        name,
                        roomId
                    }
                }


                socket.send(JSON.stringify(obj))



            }



        }
        setSocket(socket)
        // let timeOut;


        let videoSocket=new WebSocket("wss://video-backend-wrt8.onrender.com")
        videoSocket.onopen=(e)=>{
                setVideoSocket(videoSocket)
              
        }

        videoSocket.onmessage=(e)=>{
            let {type}=JSON.parse(e.data)
            let parsedObj=JSON.parse(e.data)
            
            if(type=='new-user'){
                console.log("new user joined with email :-",parsedObj.payload.email);
                
                createOffer().then((data)=>{
                 
                    let newObj={
                        type:"offer",
                        payload:{
                            offer:data,
                            email:name
                        }
                    }
                    videoSocket.send(JSON.stringify(newObj))
                })
            }
            if(type=='offer-conform'){
                let {offer}=parsedObj.payload
                createAnswer(offer).then((answer)=>{
                    let newObj={
                        type:"answer",
                        payload:{
                            answer
                        }
                        
                    }
                    console.dir(answer);
                    
                    videoSocket.send(JSON.stringify(newObj))
                })

            }

            if(type=='answer-verify'){
                let {email,answer}=parsedObj.payload
                acceptAnswer(answer).then(()=>{
                    setConnected(true);
                    let newObj={
                        type:"success"
                    }
                    console.log("old: I am connected and accepted all terms!");
                   
                    videoSocket.send(JSON.stringify(newObj))
                    setStream().then(()=>{   
                        sendStreams()
                    })
                })
                .catch((err)=>{
                    console.log("Error in +"+err);
                    
                })
            }
            if(type=='success'){
                setConnected(true)
                setStream()
                .then(()=>{   
                    sendStreams()
                })
                console.log("I also connected !");
                
            }

           
        }

        peer.onnegotiationneeded=async(ev)=>{
            
                    
               
             
                let newObja={
                    type:'del',
                    
                }
                videoSocket.send(JSON.stringify(newObja))



                let obja={
                    type:"joined",
                    payload:{
                        email:name,
                        roomId
                    }
                }
                videoSocket.send(JSON.stringify(obja))

            
        }
     

    

        return ()=> videoSocket.close();
        

    }, [])



    const onSubmit = data => console.log(data);
    return (
        <>
            {activeP && <div className='p-4 px-7 font-mono text-xl backdrop-blur-md fixed z-2 inset-0 top-1/2 left-1/2 -translate-x-[50%] flex flex-col justify-center items-center gap-10 -translate-y-[50%] h-fit w-fit rounded-md bg-zinc-400/70 '>
                <h1 className='font-extrabold text-black  text-2xl '>PLEASE ENTER THE DETAILS!</h1>
                <input onChange={(e) => setRoomId(e.target.value)} type="text" placeholder='Room Id' className='w-full bg-black rounded-md px-7 py-4 text-white placeholder-white' />
                <input onChange={(e) => setName(e.target.value)} type="text" placeholder='Name' className='w-full bg-black  text-white rounded-md px-7 py-4 placeholder-white' />
                <button onClick={() => {
                    let obj = {
                        type: "join",
                        payload: {
                            name,
                            roomId
                        }
                    }
                    console.log(obj);

                    socket.send(JSON.stringify(obj))



                    let obja={
                        type:"joined",
                        payload:{
                            email:name,
                            roomId
                        }
                    }
                    videoSocket.send(JSON.stringify(obja))


                        ; (setactiveP(() => { false }))
                }} className='w-[100%] py-3 bg-black text-white font-medium rounded-md'>Join the chat!</button>
            </div>}



             <div className={`relative flex justify-center items-center h-screen w-full bg-black/90 bg-cover bg-[url("https://images.unsplash.com/photo-1484950763426-56b5bf172dbb?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fGRhcmslMjBiYWNrZ3JvdW5kfGVufDB8fDB8fHww")]  ${activeP ? "blur-md" : ''}`} >
         {/* <div>
                    {!dis && <button disabled={dis} onClick={()=>{

                          setSpeaking((data)=>!data)
                        
                          if(speaking){
                            startRecording();
                            id.current=setInterval(()=>{
                                stopRecording()
                                console.log("Stopped! finished again ");
                                
                                startRecording()
                            },3000)
                            

                          }else{
                            clearInterval(id.current)
                            stopRecording();

                          }

                    }} className='flex items-center gap-2 p-4  bg-black text-white border-1 border-white rounded-lg'>Speaking {!speaking && <span className='h-3 w-3 bg-red-600 rounded-full inline-block '></span>} {speaking&&<span className='h-3 w-3 bg-lime-400 rounded-full inline-block animate-pulse'></span>}</button>}
                </div>  */}

                <div className=' p-3 flex flex-col justify-between h-[70%] w-[60%] border-2 border-white text-white rounded-md bg-black/40 backdrop-blur-sm '>

                    <div ref={divRef} className='max-h-[75%]   flex flex-col  overflow-y-auto '>
                        {chat.map((obj, index) => {
                            let data = new Date(obj.time)
                            let bool = (name == obj.name)
                            return <div key={index} className='max-h-[70%]  w-full '> <Message name={obj.name} message={obj.msg} date={data.toLocaleTimeString()} bool={bool} /> </div>
                        })}



                    </div>




                    <div className='flex justify-between px-3 w-[100%] min-h-1/2 '>
                       { selfS && 
                       <ReactPlayer   muted playing url={selfS} />}
                        {remS && (
                            <>
                            <h1>Remote Stream</h1>
                            <ReactPlayer
                                
                                playing
                                
                               
                                url={remS[0]}
                            />
                             <ReactPlayer url={remS[1]} playing controls style={{ display: "none" }} />
                            </>
                        )}
                      

                    </div>


                </div>





            </div>

        </>
    )
}









export default App
