import { useEffect, useRef, useState } from 'react'
import { useForm } from "react-hook-form";
import './App.css'
import Message from './Component/Message';




function App() {

    const [activeP, setactiveP] = useState(!(localStorage.getItem("roomId") && localStorage.getItem("name")))
    let [name, setName] = useState(localStorage.getItem("name"))
    let [socket, setSocket] = useState({})
    let [roomId, setRoomId] = useState(localStorage.getItem("roomId"))
    let [chat, setChat] = useState([])
    let [msg, setM] = useState("")
    let [blob, setBlob] = useState([])
    let inputRef = useRef();
    let divRef = useRef();
    let [idx,setIdx]=useState(0)
    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorder = useRef(null);
    let [speaking, setSpeaking] = useState(true);
    let [dis,setDis]=useState(false)
    let disT=useRef()
    let [audioSocket,setAudioSocket]=useState({})
    let id=useRef   (0);
    const [audioQueue, setAudioQueue] = useState([]); // Queue of audio blobs
    const isPlayingRef = useRef(false); // Pr
    const startRecording = async () => {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true});
       

        mediaRecorder.current = new MediaRecorder(stream);
        
        mediaRecorder.current.ondataavailable = (event) => {
            console.dir(event);


            if (event.data.size > 0) {
                const reader=new FileReader()
                reader.readAsArrayBuffer(event.data)
                reader.onloadend=()=>{
                    audioSocket.send(reader.result)
                }
       
            }

        };

        mediaRecorder.current.onstop = () => {
           
            console.log("Recording finished:", blob);
        };

        mediaRecorder.current.start();
        setIsRecording(true);
    };


    const stopRecording = () => {
        console.log("hi");


        mediaRecorder.current.stop();
        setIsRecording(false);
    };





    useEffect(() => {
        let real = (localStorage.getItem("roomId") != null && localStorage.getItem("name") != null);



        let socket = new WebSocket("wss://realtime-backend-y8hf.onrender.com")
        let audioSocket = new WebSocket("https://socket-2-1ks3.onrender.com")
        socket.onopen = () => {
          console.log("connected!");
          
        }
        audioSocket.onopen=()=>{
            console.log("audio connected")
            setAudioSocket(audioSocket);

            let obj = {
                type: "join",
                payload: {
                    name,
                    roomId
                }
            }
           

            audioSocket.send(JSON.stringify(obj))
        }

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
        audioSocket.onmessage=(e)=>{
            
            
            // clearTimeout(timeOut)
            let arrayBuffer=(e.data);
            
            const audioBlob=new Blob([arrayBuffer],{type:"audio/webm"});
            
            setAudioQueue((prevQueue) => [audioBlob]);
            console.log("setting disble !");
            
      

            
            // timeOut=setTimeout(()=>{setDis(false)},2000)
        }

    }, [])

    useEffect(() => {
     
          playNext();
        
      }, [audioQueue]);


  const playNext = () => {
       
        let blob=audioQueue[0];
            
        setDis(true);


        if(blob){
            let audioURL=URL.createObjectURL(blob)
            console.log(audioURL);
            let audio=new Audio(audioURL)
            audio.play()
        
        }



     
        setDis(false)
      
   
  };

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


                        ; (setactiveP(() => { false }))
                }} className='w-[100%] py-3 bg-black text-white font-medium rounded-md'>Join the chat!</button>
            </div>}



             <div className={`relative flex justify-center items-center h-screen w-full bg-black/90 bg-cover bg-[url("https://images.unsplash.com/photo-1484950763426-56b5bf172dbb?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fGRhcmslMjBiYWNrZ3JvdW5kfGVufDB8fDB8fHww")]  ${activeP ? "blur-md" : ''}`} >
         <div>
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
                </div> 

                <div className=' p-3 flex flex-col justify-between h-[70%] w-[60%] border-2 border-white text-white rounded-md bg-black/40 backdrop-blur-sm '>

                    <div ref={divRef} className='max-h-[75%]   flex flex-col  overflow-y-auto '>
                        {chat.map((obj, index) => {
                            let data = new Date(obj.time)
                            let bool = (name == obj.name)
                            return <div key={index} className='max-h-[70%]  w-full '> <Message name={obj.name} message={obj.msg} date={data.toLocaleTimeString()} bool={bool} /> </div>
                        })}



                    </div>




                    <div className='flex justify-between px-3 w-[100%] '>

                        <input ref={inputRef} onChange={(e) => setM(e.target.value)} type="text " className='bg-black placeholder-white  text-white text-lg font-semibold border-1 border-white font-mono rounded-md placeholder-black px-5 py-3 w-3/4 outline-none' placeholder='Enter message' />
                       { <button onClick={() => {

                            let obj = {
                                type: "msg",
                                payload: {
                                    chat: msg,

                                }
                            }

                            inputRef.current.value = ""
                            inputRef.current.blur()
                            socket.send(JSON.stringify(obj))

                            let scrollableDiv = divRef.current
                            scrollableDiv.scrollTo({ top: scrollableDiv.scrollHeight, behavior: "smooth" });



                            //audio



                        }} className='bg-black w-[20%] font-mono text-white bg-black border-1 border-white font-semibold tracking-wide rounded-sm'>Send Message</button>
}
                    </div>


                </div>





            </div>

        </>
    )
}









export default App
