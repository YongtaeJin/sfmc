<template>    
    <v-form @submit.prevent="onImage" ref="form" >
        <v-text-field label="사업장코드" v-model="form.c_com"  readonly/>
        <v-file-input label="이미지" v-model="form.t_image"  :multiple="false"  accept="image/jpg,image/png" /> 
        <v-btn type="submit" block color="primary" >저 장</v-btn>
    </v-form>
</template>

<script>
export default {
    name: "WorkSiteImage",
    props: {
        c_com: null,        
    },
    data() {
        return {
            form: {
                c_com : this.c_com,             
                t_image: null,
            },            
        };
    },
    watch: {
        c_com() {
            this.form.c_com = this.c_com;
            this.form.t_image = "";
        }
    },
    methods: {
        async onImage() {       
            const formData = new FormData();
			const keys = Object.keys(this.form);            
            for (const key of keys) {
                formData.append(key, this.form[key]);
            };
            const rv = await this.$axios.post(`/api/system/siteImageSave`, formData);
            this.form.t_image = "";
            this.form.c_com = "";
            this.$emit('onSave', rv);  
        }
    },
}
</script>

<style>

</style>