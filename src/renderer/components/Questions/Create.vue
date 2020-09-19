<template>
    <form class="form">
        <div class="form-group">
            <label>Tiêu đề <span class="text-danger">*</span></label>
            <input v-model="form.title" type="text" class="form-control" placeholder="Vui lòng nhập">
            <p class="text-danger help-block" v-if="form.errors.title">{{ form.errors.title }}</p>
        </div>
        <div class="form-group">
            <label>Loại câu hỏi <span class="text-danger">*</span></label>
            <select class="form-control" v-model="form.questions.type">
                <option value="1">Văn bản</option>
                <option value="2">Hình ảnh</option>
                <option value="3">Âm thanh</option>
            </select>
        </div>
        <div class="form-group" v-if="form.switch.questions.media">
            <label>Chọn tệp <span class="text-danger">*</span></label>
            <input type="file" @change="onFileChange" class="form-control" placeholder="Vui lòng nhập">
            <p class="text-danger help-block" v-if="form.errors.questions.image">{{ form.errors.questions.image }}</p>
            <p class="text-danger help-block" v-if="form.errors.questions.audio">{{ form.errors.questions.audio }}</p>
        </div>
        <div class="form-group" v-if="form.switch.questions.text">
            <label>Nội dung <span class="text-danger">*</span></label>
            <textarea v-model="form.questions.text" class="form-control" rows="3"></textarea>
            <p class="text-danger help-block" v-if="form.errors.questions.text">{{ form.errors.questions.text }}</p>
        </div>
        <div class="form-group answer">
            <label>Đáp án <span class="text-danger">*</span></label>
            <div class="clearfix" v-for="(row, index) in form.answer">
                <span class="pull-left stt">{{ row.stt }}</span>
                <div class="answer-group pull-right">
                    <label class="container-checkbox">
                        <input type="checkbox" :checked="row.active" @click="row.active = !row.active">
                        <span class="checkmark"></span>
                    </label>
                    <input v-model="row.content" type="text" class="form-control" placeholder="Vui lòng nhập">
                    <span @click="form.answer.splice(index, 1)" class="icon icon-trash text-danger"></span>
                    <p class="text-danger help-block" v-if="form.errors.answer[row.key]">{{ form.errors.answer[row.key] }}</p>
                </div>
            </div>
            <p class="text-danger help-block" v-if="form.errors.answer.index">{{ form.errors.answer.index }}</p>
            <p class="text-center add"><span @click="addAnswer">--- Thêm đáp án ---</span></p>
        </div>
        <div class="form-actions">
            <router-link :to="{name: 'questions.listing', params: {id: threads_id}}" class="btn btn-form btn-default btn-large">Hủy bỏ</router-link>
            <span @click="create" type="submit" class="btn btn-form btn-primary btn-large">Khởi tạo</span>
        </div>
    </form>
</template>

<script>
export default {
    data: () => ({
        threads_id: null,
        form: {
            title: null,
            questions: {
                type: 1,
                audio: null,
                text: null,
                image: null,
            },
            answer: [],
            switch: {
                questions: {
                    media: false,
                    text: true,
                }
            },
            errors: {},
            answer_stt: ['A','B','C','D','E','F','G','H','I','K','L','M','N','O','P','Q','R']
        },
    }),
    watch: {
        'form.questions.type': function(_new) {
            this.form.switch.questions.media = false
            this.form.switch.questions.text  = false
            switch(Number(_new)) {
                case 1:
                    this.form.switch.questions.text = true
                break
                default:
                    this.form.switch.questions.media = true
            }
        },
        'form.answer': function() {
            for(let i = 0;i < this.form.answer.length;i++) {
                this.form.answer[i].stt = i in this.form.answer_stt ? this.form.answer_stt[i] : 'NaN'
            }
        },
    },
    created() {
        this.threads_id = this.$route.params.id
        this.resetFormErrors()
        for(let i=0;i<4;i++)
            this.addAnswer()
    },
    methods: {
        onFileChange(e) {
            var files = e.target.files || e.dataTransfer.files
            if (!files.length)
                return;

            // Lấy ra base 64 của image đầu 
            var image = new Image()
            var reader = new FileReader()
            var vm = this;

            reader.onload = (e) => {
                if(Number(vm.form.questions.type) === 2)
                    vm.form.questions.image = e.target.result
                else 
                    vm.form.questions.audio = e.target.result
            }
            reader.readAsDataURL(files[0])
        },
        resetFormErrors() {
            this.form.errors = {
                title: null,
                questions: {
                    audio: null,
                    text: null,
                    image: null,
                },
                answer: {
                    index: null
                }
            }
            for(let i in this.form.answer) 
                this.form.errors.answer[this.form.answer[i].key] = null
        },
        addAnswer() {
            let uid = Math.floor(Math.random() * 100)
            this.form.answer.push({
                active: false,
                content: null,
                stt: 'NaN',
                key: uid
            })
            this.form.errors.answer[uid] = null
        },
        valiadted() {
            this.resetFormErrors()
            let pass = true;
            if(this.form.title == null) {
                pass = false
                this.form.errors.title = 'Vui lòng nhập thông tin'
            }

            if(this.form.questions.type == 2 && this.form.questions.image == null) {
                pass = false
                this.form.errors.questions.image = 'Vui lòng chọn một ảnh'
            } else if(this.form.questions.type == 3 && this.form.questions.audio == null) {
                pass = false
                this.form.errors.questions.audio = 'Vui lòng chọn một tệp âm thanh'
            } else if(this.form.questions.text == null){
                pass = false
                this.form.errors.questions.text = 'Vui lòng nhập nội dụng'
            }

            if(!this.form.answer.length) {
                this.form.errors.answer.index = 'Vui lòng thêm ít nhất 1 đáp án'
                return false
            }

            let answer_active = false
            for(let i in this.form.answer) {
                let item = this.form.answer[i]
                if(!answer_active && item.active) answer_active = true
                if(item.content === null) {
                    pass = false
                    this.form.errors.answer[item.key] = 'Vui lòng nhập nội dung'
                }
            }

            if(!answer_active) {
                pass = false
                this.form.errors.answer.index = 'Vui lòng chọn ít nhất 1 đáp án đúng'
            }
            return pass
        },
        create() {
            console.log(this.form)
            if(this.valiadted()) {
                const os = require('os')
                let timestamp = Date.now();
                const _this = this
                this.$db.Questions.insert({
                    threads_id: this.threads_id,
                    title: this.form.title,
                    questions: this.form.questions,
                    answer: this.form.answer,
                    created_at: os.userInfo().username,
                    updated_at: os.userInfo().username,
                    created_time: timestamp,
                    updated_time: timestamp,
                }, function (err, newDoc) { 
                    if(confirm('Thêm thành công, bạn có muốn tiếp tục thêm câu hỏi?')) {
                        window.location.reload()
                    } else {
                        _this.$router.push({ name: "questions.listing", params: {id: _this.threads_id}})
                    }
                });
            }
        }
    }
}
</script>