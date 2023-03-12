import { Outlet } from "@remix-run/react"

export default () => {
    return (
        <div>
            <span>from test</span>
            <Outlet />
        </div>
    )
}
