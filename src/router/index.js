import { createWebHistory, createRouter } from "vue-router";
import Wallet from "@/views/Wallet.vue";
import HowTo from "@/views/HowTo.vue";

const routes = [
    {
        path: "/",
        name: "Wallet",
        component: Wallet,
    },
    {
        path: "/howto",
        name: "HowTo",
        component: HowTo,
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;