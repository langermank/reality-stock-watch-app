import { webAuth } from '../services/web-authenticator'

export const loader = async ({ request }) => {
    return webAuth.logout(request, {
        redirectTo: '/login'
    });
}


export function Logout() {
    return <span>you're now logged out</span>
}