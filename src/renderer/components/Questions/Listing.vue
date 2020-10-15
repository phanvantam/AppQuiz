<template>
    <div>
        <div class="toolbar-actions clearfix">
                <div class="pull-left" style="width: 80%;">
                    <input @keyup.enter="getData" v-model="table.q" style="width: 23%" type="text" class="form-control" placeholder="Tiêu đề">
                    <select v-model="table.sort.point" style="width: 23%" class="form-control">
                        <option value="0">-- Sắp xếp theo điểm --</option>
                        <option value="1">Cao đến thấp</option>
                        <option value="2">Thấp đến cao</option>
                    </select>
                    <select v-model="table.sort.date" style="width: 23%" class="form-control">
                        <option value="0">-- Sắp xếp theo thời gian --</option>
                        <option value="1">Cao đến thấp</option>
                        <option value="2">Thấp đến cao</option>
                    </select>
                    <select v-model="table.sort.time" style="width: 23%" class="form-control">
                        <option value="0">-- Thời gian trả lời --</option>
                        <option value="1">Cao đến thấp</option>
                        <option value="2">Thấp đến cao</option>
                    </select>
                </div>
                <div class="btn-group pull-right">
                    <router-link :to="{name: 'questions.create', params: {id: threads_id}}" class="btn btn-large btn-positive">
                        <span class="icon icon-plus"></span> Tạo câu hỏi
                    </router-link>
                </div>
            </div>
    <table class="table">
        <thead>
            <tr>
                <th>#</th>
                <th>STT</th>
                <th>Tiêu đề</th>
                <th>Điểm</th>
                <th>Thời gian (m)</th>
                <th>Tạo lúc</th>
                <th>Cập nhật lúc</th>
                <th>Tác vụ</th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="(row, index) in table.listing">
                <td>{{ index+1 }}</td>
                <td>{{ row.stt }}</td>
                <td>{{ row.title }}</td>
                <td>{{ row.point }}</td>
                <td>{{ row.minute/60 }}</td>
                <td>{{ formatDate(row.created_time) }}</td>
                <td>{{ formatDate(row.updated_time) }}</td>
                <td class="actions">
                    <router-link :to="{name: 'questions.update', params: {id: row._id}}"><span class="icon icon-pencil"></span></router-link>
                    <a href="#" @click="removeRecord(index)"><span class="icon icon-trash"></span></a>
                </td>
            </tr>
        </tbody>
    </table>
</div>
</template>

<script>
export default {
    data: () => ({
        threads_id: null,
        table: {
            listing: [],
            sort: {
                date: 0,
                point: 0,
                time: 0,
            },
            q: ''
        },
    }),
    created() {
        this.$options.parent.setTitle('Danh sách câu hỏi')
        this.threads_id = this.$route.params.id
        this.getData()
    },
    watch: {
        'table.sort.date': function() {
            this.getData()
        },
        'table.sort.point': function() {
            this.getData()
        },
        'table.sort.time': function() {
            this.getData()
        }
    },

    methods: {
        async getData() {
            var _this = this
            var options = {threads_id: this.threads_id}
            if(this.table.q !== '') {
                options.title = {
                    $regex: new RegExp(`${this.table.q.trim()}`, 'g')
                }
            }
            var rows = await this.$db.Questions.asyncFind(options)
            if(Number(this.table.sort.date) > 0) {
                // Sort date
                rows.sort((a, b)=>{
                    if(Number(_this.table.sort.date) === 2) 
                        return a.created_time - b.created_time
                    else 
                        return b.created_time - a.created_time
                })
            }
            if(Number(this.table.sort.point) > 0) {
                // Sort point
                rows.sort((a, b)=>{
                    if(Number(_this.table.sort.point) === 2) 
                        return a.point - b.point
                    else
                        return b.point - a.point
                })
            }
            if(Number(this.table.sort.time) > 0) {
                // Sort time
                rows.sort((a, b)=>{
                    if(Number(_this.table.sort.time) === 2) 
                        return a.time - b.time
                    else
                        return b.time - a.time
                })
            }
            // Sort stt
            rows.sort((a, b)=>{
                return a.stt - b.stt
            })
            this.table.listing = rows
        },
        formatDate(unix_timestamp) {
            return new Date(unix_timestamp).toISOString().slice(0, 19).replace('T', ' ')
        },
        async removeRecord(index) {
            const row = this.table.listing[index]
            if(confirm(`Xác nhận xóa "${row.title}"`)) {
                // Xóa câu hỏi, Xóa media
                let trash = {
                    media: [],
                    questions: row._id
                }
                // Lấy tất cả media đang dùng
                // Lấy media trong answer
                for(let i2 in row.answer) {
                    if('image' in row.answer[i2] && row.answer[i2].image != null) 
                        trash.media.push(row.answer[i2].image)
                }
                for(let i2 in row.questions) {
                    if(i2 !== 'type' && row.questions[i2] !== null) {
                        trash.media.push(row.questions[i2])
                    }
                }
                await this.$db.Media.asyncRemove({ _id: {$in: trash.media}}, { multi: true })
                await this.$db.Questions.asyncRemove({ _id: trash.questions})
                this.$options.parent.writeLog(3, trash.questions, `Đã xóa câu hỏi "${row.title}"`)
                this.getData()
            }
        }
    }
}
</script>