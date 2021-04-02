import { createWebHistory, createRouter } from "vue-router";
import Wallet from "@/views/Wallet.vue";
import HowTo from "@/views/HowTo.vue";
import Terms from "@/views/Terms.vue";

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
    {
        path: "/terms",
        name: "Terms",
        component: Terms,
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;