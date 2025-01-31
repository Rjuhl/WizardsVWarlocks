import React, { useEffect } from 'react';
import stickFigure from '../../images/stick_figure.png'; 
import wizardHat from "../../images/wizard_hat.png"
import wizardStaff from "../../images/wizard_staff.png"
import { hsvaToHex } from '@uiw/color-convert';


export default function CharacterCanvas(props) {
    const black = { h: 0, s: 0, v: 0, a: 0 }
    const scale = props.scale || 1
    const canvasSize = Math.round(300 * scale)
    const canvasId = props.canvasId || "characterCanvas";

    useEffect(() => {
        drawImage(wizardHat, props.hatHsva, 15 * scale, 10 * scale, 0.15 * scale)
        drawImage(wizardStaff, props.staffHsva, 160 * scale, 60 * scale, 0.5 * scale)
    }, [props.hatHsva, props.staffHsva]) 

    useEffect(() => {
        drawImage(stickFigure, black, 0, 60 * scale, 0.75 * scale)
    }, []) 

    const drawOffScreenCanvas = (color, img) => {
        const [r, g, b] = hsvaToHex(color).match(/\w\w/g).map(x => parseInt(x, 16))
        const offscreenCanvas = document.createElement('canvas')
        const offscreenCtx = offscreenCanvas.getContext('2d')

        offscreenCanvas.width = img.width
        offscreenCanvas.height = img.height
        offscreenCtx.drawImage(img, 0, 0)

        const imageData = offscreenCtx.getImageData(0, 0, offscreenCanvas.width, offscreenCanvas.height)
        const data = imageData.data

        for (let i = 0; i < data.length; i += 4) {
            if (data[i] <= 0 && data[i + 1] <= 0 && data[i + 2] <= 0 && data[i + 3] > 0) {
                data[i] = r
                data[i + 1] = g
                data[i + 2] = b
                data[i + 3] = 255
            }
        }

        offscreenCtx.putImageData(imageData, 0, 0);
        return offscreenCanvas
    }

    const drawImage = (src, color, x, y, scale) => {
        const img = new Image()
        img.crossOrigin = "anonymous"
        img.src = src 

        const canvas = document.getElementById(canvasId)
        const ctx = canvas.getContext("2d")

        img.onload = () => {
            const colorImage= drawOffScreenCanvas(color, img)
            ctx.drawImage(colorImage, x, y, img.width * scale, img.height * scale);
        }

        img.onerror = (error) => {
            console.error("Image failed to load", error)
        }
    }

    return (
        <> 
            <canvas id={canvasId} width={canvasSize} height={canvasSize}></canvas>
        </>
    )
}