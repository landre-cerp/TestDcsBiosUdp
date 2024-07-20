# Inmportant
This is a Wip project, it is not finished yet, used to learn about DCS-BIOS and how to interact with it.

# install

```bash
npm install
```

# Readme ! 

compile with

```bash
npx tsc
```
or npm run build

run with 

```bash 
node dist/index.js
``` 

or npm run start

# External documentation

From this https://forum.dcs.world/topic/213266-how-to-read-dcs-bios-read-export-messages-from-c/?_fromLogin=1
    

> Posted September 10, 2019 (edited)
All of the control information is available in the DCS-BIOS project. This file for the A-10 (for example):
>
> https://github.com/dcs-bios/dcs-bios/blob/master/Scripts/DCS-BIOS/doc/json/A-10C.json
>
>Basically I just read that file in and split it into input controls and output controls, the outputs are what you care about parsing. The last function in the source code I posted (buildOutputAddressMap) re-maps that structure for fast lookup by the address, which is faster and more convenient when you are parsing the output stream.
>
> **One thing to be aware of is DCS-BIOS maintains a buffer of all control values in Lua memory, and it transmits updates to that information in small segments. You should maintain a shadow copy of the entire buffer on your side and apply the updates to your copy as they stream in. Then, you can interpret the values from the buffer as you need them. This is necessary because in some cases you will get partial updates to string data, so you cannot form the full picture from just the network stream alone.** 
>
>The first function I posted (applyUpdates) updates the local buffer, and the second function (mapUpdatesToControls) maps the updated raw values from the buffer to the more "friendly" control structure that is used thereafter. This process involves some manipulation of the raw value based on the mask, shift_by, etc. in the control metadata.