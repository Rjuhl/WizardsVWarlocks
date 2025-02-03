import React, { useState, Fragment, useEffect, useContext } from 'react';
import Wheel from '@uiw/react-color-wheel';
import ShadeSlider from '@uiw/react-color-shade-slider';
import CharacterCanvas from './character';
import Context from '../providers/context';

/* <div style={{ width: '100%', height: 34, marginTop: 20, background: hsvaToHex(hsva) }}></div> */

export default function CharacterCustomization() {
    const [userInfo, setUserInfo] = useContext(Context)
    const [hatHsva, setHatHsva] = useState({ h: 0, s: 0, v: 68, a: 1 });
    const [staffHsva, setStaffHsva] = useState({ h: 0, s: 0, v: 68, a: 1 });

    useEffect(() => {
        updateContext()
    }, [hatHsva, staffHsva])

    const updateContext = () => {
        userInfo['hatColor'] = [hatHsva['h'], hatHsva['s'], hatHsva['v']]
        userInfo['staffColor'] = [staffHsva['h'], staffHsva['s'], staffHsva['v']]
        setUserInfo(userInfo)
    }

    return (
        <>  
            <CharacterCanvas staffHsva={staffHsva} setStaffHsva={setStaffHsva} hatHsva={hatHsva}  setHatHsva={setHatHsva} scale={1}/>
            <div className='colorWheelDiv'>
                <div>
                    <Fragment>
                        <h2 className="medium-header" >Hat Color</h2>
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
                    <h2 className="medium-header">Staff Color</h2>
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

