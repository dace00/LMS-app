import {Outlet} from "react-router-dom";

function GlobalStyle() {
    return (
        <div className="min-h-screen w-full bg-linear-to-br from-zinc-500 via-[#001f3f]
       to-zinc-500 animate-[gradient-shift_6s_ease-in-out_infinite_alternate] bg-animated  bg-[length:300%_300%] transition-all duration-1">
            <main className="flex-1 flex flex-col">
            <Outlet/>
            </main>
        </div>
    )
}

export default GlobalStyle;