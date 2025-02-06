import React from 'react'

const Message = ({name,message,date,bool}) => {
  return (
    <div className={` font-mono w-full py-1 mt-1 flex ${bool ? 'justify-end':'justify-start'}`}>
        <div className='w-fit px-2'>
                <div className='text-xs font-normal pb-1'> {name}</div>
                <div className='text-xl font-semibold tracking-tight'>{message}</div>
                <div className='text-xs font-normal text-slate-300'>{date}</div>
        </div>
    </div>
  )
}

export default Message