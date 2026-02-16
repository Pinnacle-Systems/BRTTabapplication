import React, { useEffect } from 'react'
import { useGetLAbQuery } from '../redux/labservice'

const Machine = () => {

    const{data:singl,isFetching,refetch}=useGetLAbQuery();
    console.log(singl);
  useEffect(()=>{
    refetch();
  },[refetch])
    
  return (
    <div>Machine</div>
  )
}

export default Machine