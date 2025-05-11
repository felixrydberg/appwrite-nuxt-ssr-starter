import { defineStore } from "pinia";
import type { Store } from "~/types";

export const useStore = defineStore("store", {
  state: (): Store => ({
    user: null,
  }),
})

export default useStore
