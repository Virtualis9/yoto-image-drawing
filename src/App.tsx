import { Button, Container, Flex, Input, Stack } from "@mantine/core";
import { useRef, useState } from "react"

/**
 * TODO:
 *  Add modes support DRAW | DELETE
 *  Fix export
 *  Fix export preview (90% rotated for some reason)
 *  Add semi decent toolbars for colors / modes etc ... 
 *  Added this comment to show i can use Git..well try..
 */


type DRAW_MODE = "DRAW" | "DELETE";

function App() {

  const PIXEL_SIZE: number = 25;
  const GRID_SIZE: number = 16;
  const DEFAULT_COLOUR: string | null = null;

  const [mode, setMode] = useState<DRAW_MODE>("DRAW");

  const [name, setName] = useState<string>("my_yoto_image");
  const [colours, setColours] = useState<string[]>([]);

  const [pixels, setPixels] = useState<string[][]>(new Array(GRID_SIZE).fill(DEFAULT_COLOUR).map(() => new Array(GRID_SIZE).fill(DEFAULT_COLOUR)));

  const colourPicker = useRef<HTMLInputElement>(null);
  const exportCanvas = useRef<HTMLCanvasElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);


  const onPixelClicked = (x: number, y: number) => {

    const selectedColour: string = colourPicker.current?.value as string;

    let next = [...pixels];

    switch(mode)
    {
      case "DELETE":
        next[x][y] = null; //todo: find how to type the pixel array properly.
        break;
      case "DRAW":
      default:
        next[x][y] = selectedColour;
        break;
    }
    

    setPixels(next);

    if (colours.indexOf(selectedColour) == -1) {
      setColours((current) => [...current, selectedColour]);
    }

  }

  const onColourClicked = (colourHex: string) => {
    //set colour picker value. 
    if (colourPicker.current) {
      colourPicker.current.value = colourHex;
    }
  }

  const exportPNG = () => {

    if (!exportCanvas.current) {
      alert("canvas being fucky, can't export.");
      return;
    }

    var ctx = exportCanvas.current.getContext("2d");
    if (!ctx) {
      alert("something fucky with the context");
      return;
    }


    //TODO: fix the drawing being rotated 90degress.     
    for (let x = 0; x < 16; x++) {
      for (let y = 0; y < 16; y++) {
        const pixel = pixels[y][x];
        if (pixel) {
          ctx.rect(y, x, 1, 1);
          ctx.fillStyle = pixel;
          ctx.fillRect(x, y, 1, 1);
        }
        else {
          ctx.globalAlpha = 0;
          ctx.fillRect(y, x, 1, 1);
          ctx.globalAlpha = 1;
        }
      }
    }



    //todo: reactify this
    var image = exportCanvas.current.toDataURL();
    var aDownloadLink = document.createElement('a');
    aDownloadLink.download = `${name ?? "my_yoto_image"}.png`;
    aDownloadLink.href = image;
    aDownloadLink.click();

  }

  interface ImageConfig {
    image_name: string,
    pixels: string[][],
    grid_size: number,
    palette: string[]
  }

  const exportJSON = () => {
    const cfg: ImageConfig = {
      image_name: name ?? "yoto_pic",
      pixels: pixels,
      grid_size: GRID_SIZE,
      palette: colours
    };

    const jsonString = JSON.stringify(cfg);

    //todo: reactify this
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(jsonString));
    element.setAttribute('download', `${cfg.image_name}.json`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }


  //TODO: add event type
  const importFile = async (e: React.ChangeEvent<HTMLInputElement>) => {

    const reader = new FileReader()
    reader.onload = async (e) => {
      if (e.target) {
        const json = (e.target.result)
        var _config = JSON.parse(json as string);
        setPixels(_config.pixels);
        setColours(_config.palette);
        setName(_config.image_name);
      }


    };

    if (e.target.files) {
      reader.readAsText(e.target.files[0])
    }
    else {
      alert('no files selected');
    }
  }

  const fill = () => {
    const colourHex: string = colourPicker.current?.value as string;
    setPixels(new Array(GRID_SIZE).fill(colourHex).map(() => new Array(GRID_SIZE).fill(colourHex)))
  }

  return (
    <Container>
      <div style={{ display: "flex", flexDirection: "row", margin: 8 }}>
        <input ref={fileInput} type="file" onChange={importFile} style={{ display: 'none' }}></input>
        <div style={{ display: 'fex', flexDirection: 'column' }}>

          <Stack>
            <canvas ref={exportCanvas} width={16} height={16} style={{maxHeight:16, maxWidth:16}}></canvas>
            <Button onClick={() => exportPNG()} disabled={name.length === 0}>export image</Button>
            <Button onClick={() => exportJSON()} disabled={name.length === 0}>export config</Button>
            <Button onClick={() => fileInput.current?.click()}>Import config</Button>
          </Stack>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

          </div>

        </div>



        <div style={{ display: 'flex', flexDirection: 'column', marginLeft: 8 }}>
          {name.length == 0 && <div style={{ background: 'red', color: 'white', padding: '8px', marginBottom: 8 }}>Enter a name to export</div>}
          {/* <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="image name ... "></input> */}
          <Input variant="filled" size="md" radius="xs" value={name} onChange={(e) => setName(e.target.value)} placeholder="image name ... " />
          {/* <div style={{ display: 'flex', flexDirection: 'row', marginBottom: 8, gap: 4, alignItems: 'center' }}> */}
         
         <Flex direction={"row"} gap={8}>
          <Button variant={mode === "DRAW" ? "filled" : "outline"} onClick={() => setMode("DRAW")}>Draw</Button>
          <Button variant={mode === "DELETE" ? "filled" : "outline"} onClick={() => setMode("DELETE")}>Erase</Button>
         </Flex>
         
            <Flex 
              direction={"row"} 
              gap={"md"}
              justify={"flex-start"}
              align={"flex-start"}
              >
            <input ref={colourPicker} type="color" />

            <Button onClick={fill}>fill</Button>


            <div style={{ display: 'flex', flexDirection: 'row', gap: 2 }}>
              {colours.map(colour => <div key={colour} onClick={() => { onColourClicked(colour) }} style={{ width: 32, height: 32, background: colour, border: "1px solid black", }}></div>)}
            </div>
            </Flex>
          {/* </div> */}

          {pixels.map((px, pxi) => {

            return (
              <div style={{ display: "flex", flexDirection: "row" }} key={`row_${pxi}`}>
                {px.map((py, pyi) => {

                  const chequered = {
                    'backgroundImage': "linear-gradient(45deg, #bbbdbf 25%, transparent 25%),linear-gradient(45deg, transparent 75%, #bbbdbf 75%),linear-gradient(45deg, transparent 75%, #bbbdbf 75%),linear-gradient(45deg, #bbbdbf 25%, #fff 25%)",
                    'backgroundSize': `${PIXEL_SIZE}px ${PIXEL_SIZE}px`,
                    'backgroundPosition': `0 0, 0 0, -${PIXEL_SIZE / 2}px -${PIXEL_SIZE / 2}px, ${PIXEL_SIZE / 2}px ${PIXEL_SIZE / 2}px`
                  };

                  const backgroundColour = {
                    'backgroundColor': py
                  }

                  const pixel_background = py ? backgroundColour : chequered;

                  return <div key={`pixel_${pxi}_${pyi}`} onClick={() => onPixelClicked(pxi, pyi)} style={{ width: PIXEL_SIZE, height: PIXEL_SIZE, marginRight: PIXEL_SIZE / 4, marginBottom: PIXEL_SIZE / 4, border: "1px solid black", ...pixel_background }}></div>
                })}
              </div>
            )
          })}

        </div>
      </div>
    </Container>
  )
}

export default App
