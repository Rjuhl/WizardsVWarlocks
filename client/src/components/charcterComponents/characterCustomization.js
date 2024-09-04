import React, { useState, Fragment, useEffect, useContext } from 'react';
import { hsvaToHex } from '@uiw/color-convert';
import Wheel from '@uiw/react-color-wheel';
import ShadeSlider from '@uiw/react-color-shade-slider';
import CharacterCanvas from './character';
import Context from '../context';

/* <div style={{ width: '100%', height: 34, marginTop: 20, background: hsvaToHex(hsva) }}></div> */

export default function CharacterCustomization() {
    const [userInfo, setUserInfo] = useContext(Context)
    const [hatHsva, setHatHsva] = useState({ h: 0, s: 0, v: 68, a: 1 });
    const [staffHsva, setStaffHsva] = useState({ h: 0, s: 0, v: 68, a: 1 });

    useEffect(() => {
        updateContext()
    }, [hatHsva, staffHsva])

    const updateContext = () => {
        userInfo['hatColor'] = hsvaToHex(hatHsva).match(/\w\w/g).map(x => parseInt(x, 16))
        userInfo['staffColor'] = hsvaToHex(staffHsva).match(/\w\w/g).map(x => parseInt(x, 16))
        setUserInfo(userInfo)
    }

    return (
        <>  
            <CharacterCanvas staffHsva={staffHsva} setStaffHsva={setStaffHsva} hatHsva={hatHsva}  setHatHsva={setHatHsva} scale={1}/>
            <div className='colorWheelDiv'>
                <div>
                    <Fragment>
                        <h2>Hat Color</h2>
                        <br></br>
                        <Wheel 
                            color={hatHsva} 
                            style={{}}
                            onChange={(color) => setHatHsva({ ...hatHsva, ...color.hsva })} 
                        />
                        <ShadeSlider
                            hsva={hatHsva}
                            style={{ width: 210, marginTop: 20 }}
                            onChange={(newShade) => {
                                setHatHsva({ ...hatHsva, ...newShade });
                            }}
                        />
                    </Fragment>
                </div>
                <br></br>
                <div>
                    <h2>Staff Color</h2>
                    <br></br>
                    <Fragment>
                        <Wheel 
                            color={staffHsva} 
                            style={{}}
                            onChange={(color) => setStaffHsva({ ...staffHsva, ...color.hsva })} 
                        />
                        <ShadeSlider
                            hsva={staffHsva}
                            style={{ width: 210, marginTop: 20 }}
                            onChange={(newShade) => {
                                setStaffHsva({ ...staffHsva, ...newShade });
                            }}
                        />
                    </Fragment>
                </div>
            </div>
        </>
    )
}

