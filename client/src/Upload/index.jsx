import React from 'react';
import empty from "../../src/img/empty.png"

const BrowseSingleImage = ({ picture, setPicture, readOnly }) => {
    console.log(picture, 'pic');

    const imageFormatter = () => {
        if (picture) {
            if (typeof (picture) === "object") {
                return URL.createObjectURL(picture)
            } else {
                return picture
            }
        }
        return null
    }

    const imageWidth = "100px"
    const imageHeight = "100px";
    console.log(picture, 'pic')
    return (
        <div className='flex gap-1 flex-col items-center justify-end'>
            <div className='flex items-center justify-center '>
                {Boolean(picture) ?
                    <img style={{ height: imageHeight, width: imageWidth, objectFit: 'cover' }}
                        src={imageFormatter()}
                    />
                    :
                    <img src={empty} className='w-36' />
                }
            </div>
            <div className='flex flex-col gap-2'>
                <>
                    <div className='flex justify-center gap-2 my-3'>
                        <div className='flex items-center border border-gray-700 hover:border-lime-500 rounded-md h-8 px-1 bg-green-500'>
                            <input type="file" id="profileImage" className='hidden' onChange={(e) => {
                                if (readOnly) return
                                setPicture(e.target.files[0])
                            }} />
                            <label htmlFor="profileImage" className="text-xs w-full"> Browse</label>
                        </div>
                        <div className='border border-gray-700 rounded-md h-8 items-center px-2 text-xs hover:border-red-400  bg-red-600 w-full text-white'>
                            <button onClick={() => { setPicture(null) }} className='flex items-center h-full'>Delete</button>
                        </div>
                    </div>
                </>
            </div >
        </div>
    );
};

export default BrowseSingleImage;