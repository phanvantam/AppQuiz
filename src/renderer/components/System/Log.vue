<template>
    <div>
    <table class="table">
        <thead>
            <tr>
                <th>STT</th>
                <th>Bản ghi</th>
                <th>Hành động</th>
                <th>Nội dung</th>
                <th>Người thao tác</th>
                <th>Thời gian</th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="(row, index) in table.listing">
                <td>{{ index+1 }}</td>
                <td>{{ row.record_id }}</td>
                <td>{{ row.type }}</td>
                <td>{{ row.note }}</td>
                <td>{{ row.created_at }}</td>
                <td>{{ formatDate(row.created_time) }}</td>
            </tr>
        </tbody>
    </table>
</div>
</template>

<script>
export default {
    data: () => ({
        table: {
            listing: []
        },
    }),
    created() {
        this.$options.parent.setTitle('Lịch sử thao tác')
        this.getData()
    },
    methods: {
        async getData() {
            this.table.listing = (await this.$db.Logs.asyncFind({})).sort((a, b)=>{
                    return b.created_time - a.created_time
                })
        },
        formatDate(unix_timestamp) {
            return new Date(unix_timestamp).toISOString().slice(0, 19).replace('T', ' ')
        }
    }
}
</script>