import { Divider, Stack } from "@mui/material";
import Converter from "../utils/converter";

export default function Modifier(props) {
    const modfier = props.modifier.multiplier;
    const type = props.modifier.type;
    const role = props.modifier.role;
    const status = props.modifier.active;
    const converter = new Converter();

    return (
        <>
        <div className="spellComponent">
            <Stack>
                <Stack direction="row">
                    <div>Type: <b>{converter.spellClassToString(type)}</b></div>
                    <Divider orientation="vertical" sx={{mx: 1}}></Divider>
                    <div>Role: <b>{converter.spellTypeToString(role)}</b></div>
                </Stack> 
                <div>Multiplier: <b>x{modfier}</b></div>
                <div>Status: <b>{status}</b></div>
            </Stack>
        </div>
        </>
    );
}