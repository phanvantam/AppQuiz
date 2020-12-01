<template>
    <div>
        <div class="toolbar-actions clearfix">
                <div class="pull-left" style="width: 80%;">
                    <input @keyup.enter="getData" v-model="table.q" style="width: 23%" type="text" class="form-control" placeholder="Tiêu đề">
                    <select v-model="table.sort.total" style="width: 23%" class="form-control">
                        <option value="0">-- Sắp xếp theo số câu hỏi --</option>
                        <option value="1">Cao đến thấp</option>
                        <option value="2">Thấp đến cao</option>
                    </select>
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
                </div>
                <div class="btn-group pull-right">
                    <router-link to="/threads/create" class="btn btn-large btn-positive">
                        <span class="icon icon-plus"></span> Tạo đề
                    </router-link>
                </div>
            </div>
    <table class="table">
        <thead>
            <tr>
                <th>STT</th>
                <th>Tiêu đề</th>
                <th>Số câu hỏi</th>
                <th>Tổng điểm</th>
                <th>Thời gian đọc (m)</th>
                <th>Thời gian nghe (m)</th>
                <th>Tạo lúc</th>
                <th>Cập nhật lúc</th>
                <th>Tác vụ</th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="(row, index) in table.listing">
                <td>{{ index+1 }}</td>
                <td>{{ row.title }}</td>
                <td>{{ row.questions.count }}</td>
                <td>{{ row.questions.point }}</td>
                <td>{{ row.time_read }}</td>
                <td>{{ row.time_listen }}</td>
                <td>{{ formatDate(row.created_time) }}</td>
                <td>{{ formatDate(row.updated_time) }}</td>
                <td class="actions">
                    <router-link :to="{name: 'questions.listing', params: {id: row._id}}"><span class="icon icon-folder"></span></router-link>
                    <router-link :to="{name: 'threads.update', params: {id: row._id}}"><span class="icon icon-pencil"></span></router-link>
                    <a href="#" @click="exportHtml(index)"><span class="icon icon-download"></span></a>
                    <a href="#" @click="copy(index)"><span class="icon icon-clipboard"></span></a>
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
        table: {
            listing: [],
            sort: {
                date: 0,
                point: 0,
                total: 0
            },
            q: ''
        },
    }),
    created() {
        this.$options.parent.setTitle('Danh sách đề')
        this.getData()
    },
    watch: {
        'table.sort.date': function() {
            this.getData()
        },
        'table.sort.point': function() {
            this.getData()
        },
        'table.sort.total': function() {
            this.getData()
        }
    },
    methods: {
        async getData() {
            const _this = this
            var options = {}
            if(this.table.q !== '') {
                options.title = {
                    $regex: new RegExp(`${this.table.q.trim()}`, 'g')
                }
            }
            var rows = await this.$db.Threads.asyncFind(options)
            for(let index in rows) {
                let questions = await this.$db.Questions.asyncFind({'threads_id': rows[index]._id})
                rows[index].questions = {}
                rows[index].questions.count = questions.length
                rows[index].questions.point = 0
                rows[index].questions.minute = 0
                for(let i in questions) {
                    rows[index].questions.point += Number(questions[i].point)
                    rows[index].questions.minute += Number(questions[i].minute)
                }
            }
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
                        return a.questions.point - b.questions.point
                    else
                        return b.questions.point - a.questions.point
                })
            }
            if(Number(this.table.sort.total) > 0) {
                // Sort số câu hỏi
                rows.sort((a, b)=>{
                    if(Number(_this.table.sort.total) === 2) 
                        return a.questions.count - b.questions.count
                    else
                        return b.questions.count - a.questions.count
                })
            }
            this.table.listing = rows
        },
        formatDate(unix_timestamp) {
            return new Date(unix_timestamp).toISOString().slice(0, 19).replace('T', ' ')
        },
        async removeRecord(index) {
            const row = this.table.listing[index]
            if(confirm(`Xác nhận xóa "${row.title}"`)) {
                // Xóa đề, Xóa câu hỏi, Xóa media
                let trash = {
                    media: [],
                    threads: row._id
                }
                // Lấy tất cả media đang dùng
                if(row.description.type == 1)
                    trash.media.push(row.description.image)

                const questions = await this.$db.Questions.asyncFind({'threads_id': trash.threads})
                for(let i in questions) {
                    // Lấy media trong answer
                    for(let i2 in questions[i].answer) {
                        if('image' in questions[i].answer[i2] && questions[i].answer[i2].image != null) 
                            trash.media.push(questions[i].answer[i2].image)
                    }
                    for(let i2 in questions[i].questions) {
                        if(i2 !== 'type' && questions[i].questions[i2] !== null) {
                            trash.media.push(questions[i].questions[i2])
                        }
                    }
                }
                await this.$db.Media.asyncRemove({ _id: {$in: trash.media}}, { multi: true })
                await this.$db.Questions.asyncRemove({ threads_id: trash.threads}, { multi: true })
                await this.$db.Threads.asyncRemove({_id: trash.threads})
                this.$options.parent.writeLog(3, trash.threads, `Đã xóa đề "${row.title}"`)
                this.getData()
            }
        },
        changeToSlug(title)
        {
            var slug;
         
            //Đổi chữ hoa thành chữ thường
            slug = title.toLowerCase();
         
            //Đổi ký tự có dấu thành không dấu
            slug = slug.replace(/á|à|ả|ạ|ã|ă|ắ|ằ|ẳ|ẵ|ặ|â|ấ|ầ|ẩ|ẫ|ậ/gi, 'a');
            slug = slug.replace(/é|è|ẻ|ẽ|ẹ|ê|ế|ề|ể|ễ|ệ/gi, 'e');
            slug = slug.replace(/i|í|ì|ỉ|ĩ|ị/gi, 'i');
            slug = slug.replace(/ó|ò|ỏ|õ|ọ|ô|ố|ồ|ổ|ỗ|ộ|ơ|ớ|ờ|ở|ỡ|ợ/gi, 'o');
            slug = slug.replace(/ú|ù|ủ|ũ|ụ|ư|ứ|ừ|ử|ữ|ự/gi, 'u');
            slug = slug.replace(/ý|ỳ|ỷ|ỹ|ỵ/gi, 'y');
            slug = slug.replace(/đ/gi, 'd');
            //Xóa các ký tự đặt biệt
            slug = slug.replace(/\`|\~|\!|\@|\#|\||\$|\%|\^|\&|\*|\(|\)|\+|\=|\,|\.|\/|\?|\>|\<|\'|\"|\:|\;|_/gi, '');
            //Đổi khoảng trắng thành ký tự gạch ngang
            slug = slug.replace(/ /gi, " - ");
            //Đổi nhiều ký tự gạch ngang liên tiếp thành 1 ký tự gạch ngang
            //Phòng trường hợp người nhập vào quá nhiều ký tự trắng
            slug = slug.replace(/\-\-\-\-\-/gi, '-');
            slug = slug.replace(/\-\-\-\-/gi, '-');
            slug = slug.replace(/\-\-\-/gi, '-');
            slug = slug.replace(/\-\-/gi, '-');
            slug = slug.replace(/\s/gi, '');
            //Xóa các ký tự gạch ngang ở đầu và cuối
            slug = '@' + slug + '@';
            slug = slug.replace(/\@\-|\-\@|\@/gi, '');
            return slug;
        },
        async exportHtml(index) {
            if(!confirm("Xác nhận tải xuống đề dưới dạng tệp?")) {
                return;
            }
            var row = this.table.listing[index]
            var questions = (await this.$db.Questions.asyncFind({'threads_id': row._id})).sort((a, b)=>{
                    return a.stt - b.stt
                })

            var welcome = {
                button: [
                    "data:image/jpeg;base64,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",
                    "data:image/jpeg;base64,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"
                ]
            }
            switch(Number(row.description.type)) {
                case 1:
                    welcome.img = this.$options.parent.readFile((await this.$db.Media.asyncFindOne({ _id: row.description.image})).base64)
                break
                case 2:
                    welcome.video = row.description.video
                break
                default:
                    welcome = null
            }
            welcome = welcome == null ? '' : (JSON.stringify(welcome)+',')

            for(let i in questions) {
                for(let i2 in questions[i].questions) {
                    if(i2 !== 'type' && questions[i].questions[i2] !== null) {
                        questions[i].questions[i2] = this.$options.parent.readFile((await this.$db.Media.asyncFindOne({ _id: questions[i].questions[i2]})).base64)
                    }
                }
                for(let i2 in questions[i].answer) {
                    if('image' in questions[i].answer[i2] && questions[i].answer[i2].content === null  && questions[i].answer[i2].image !== null) {
                        questions[i].answer[i2].image = this.$options.parent.readFile((await this.$db.Media.asyncFindOne({ _id: questions[i].answer[i2].image})).base64)
                    }
                }
            }
            var template = require('raw-loader!@/assets/templates/lam-de.txt').default
            template = template.replace('(welcome)', welcome)
            var MD5 = require("crypto-js/md5")

            var password = row.password == "" || row.password == null ? '' : MD5(row.password)

            template = template.replace('(password)', password)
            template = template.replace('(time_read)', row.time_read)
            template = template.replace('(time_listen)', row.time_listen)
            template = template.replace('(questions)', JSON.stringify(questions))

            var fileURL = window.URL.createObjectURL(new Blob([template]));
            var fileLink = document.createElement('a');
            fileLink.href = fileURL;
            fileLink.setAttribute('download', this.changeToSlug(row.title)+'.html');
            document.body.appendChild(fileLink);
            fileLink.click();
            this.$options.parent.writeLog(4, row._id, `Đã tải xuống đề "${row.title}"`)
        },
        async copy(index) {
            if(!confirm("Xác nhận nhân bản đề?")) {
                return;
            }
            var row = this.table.listing[index]
            var questions = (await this.$db.Questions.asyncFind({'threads_id': row._id}))

            delete row._id
            row.title  += ' - Copy'
            await this.$db.Threads.asyncInsert(row).then(doc => {
                row = doc
            })
            for(let i in questions) {
                delete questions[i]._id
                questions[i].threads_id = row._id
                await this.$db.Questions.asyncInsert(questions[i])
            }
            this.getData()
        }
    }
}
</script>