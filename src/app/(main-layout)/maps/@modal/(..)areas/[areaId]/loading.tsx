"use client"

import { useEffect } from "react";
import { toast } from "sonner";

export default function AreaModalloading() {
    useEffect(() => {
        toast.loading("Загрузка...", { id: "loading-modal", position: "bottom-center" });
        return () => {
            toast.dismiss("loading-modal");
        };
    }, [])

    return null;
}
