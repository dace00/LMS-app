import {Outlet} from "react-router-dom";

function GlobalStyle() {
    return (
        <div className="min-h-full w-full bg-zinc-800">
            <main className="flex-1 flex flex-col">
            <Outlet/>
            </main>
        </div>
    )
}

export default GlobalStyle;