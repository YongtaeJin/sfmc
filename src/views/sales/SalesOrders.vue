<template>
  
</template>

<script>
import qs from "qs";
import { mapActions } from "vuex";
import EzDialog from '../../components/etc/EzDialog.vue';
import TooltipBtn from '../../components/etc/TooltipBtn.vue';
export default {
    components: { TooltipBtn, EzDialog },
    name: "Salesorders",
    mounted() {
        this.init();
    },
    data() {
        return {
        }
    },
    watch: {
    },
    computed: {
    },
    methods: {
        ...mapActions("sales"),
        async init() {
        },
    }

}
</script>

<style>

</style>