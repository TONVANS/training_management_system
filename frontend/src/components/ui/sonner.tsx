"use client"

import { Toaster as Sonner } from "sonner"
import { Noto_Sans_Lao } from "next/font/google"

const notoSanLao = Noto_Sans_Lao({
    subsets: ["lao"],
    weight: ["400", "700"],
    display: 'swap',
});

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
    return (
        <Sonner
            className="toaster group"
            richColors
            closeButton
            position="top-right"
            style={{
                fontFamily: notoSanLao.style.fontFamily,
            }}
            {...props}
        />
    )
}

export { Toaster }
