<template>
	<div>
		 <v-container fill-height fluid> 
    		<v-row class="text-center">
      			<v-col cols="12">
        			<v-img :src="require('../../server/upload/mainlog.jpeg')" contain height="200" />
      			</v-col>
      		<v-col class="mb-4">
        	<h1 class="display-5 font-weight-bold">
				로그인 후 사용 가능 합니다.
        	</h1>
      		</v-col>   
		    </v-row>
			
			<v-btn to="/login" block>로그인</v-btn>
		 </v-container>
         
	</div>
</template>

<script>
export default {
	name : "NotLogin"
}
</script>

<style>

</style>