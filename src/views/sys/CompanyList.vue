<template>    
        <table>           
            <tr>
                <td> {{ ditem.i_com}} </td>
                <td> {{ ditem.n_com}} </td>
                <td> {{ ditem.i_creg}} </td>
                <td> {{ ditem.n_pernm}} </td>
                <td> {{ ditem.t_tel}} </td>
                <td> {{ ditem.t_fax}} </td>
                <td> {{ ditem.t_email}} </td>
            </tr>
        </table>    
</template>

<script>
export default {
    name: "CompanyList",
    props: {
    ditem: {
      type: Object
    },
  },
}
</script>

<style>

</style>