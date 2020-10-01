<template>
    <form class="form" @submit.prevent="update">
        <div class="form-group">
            <label>Tiêu đề <span class="text-danger">*</span></label>
            <input v-model="form.title" type="text" class="form-control" placeholder="Vui lòng nhập">
            <p class="text-danger help-block" v-if="form.errors.title">{{ form.errors.title }}</p>
        </div>
        <div class="form-group">
            <label>Mật khẩu</label>
            <input v-model="form.password" type="text" class="form-control" placeholder="Vui lòng nhập một mật khẩu">
        </div>
        <div class="form-group">
            <label>Mô tả</label>
            <select class="form-control" v-model="form.description.type">
                <option value="0">-- Không có --</option>
                <option value="1">Hình ảnh</option>
                <option value="2">Video</option>
            </select>
            <p class="text-danger help-block" v-if="form.errors.description.type">{{ form.errors.description.type }}</p>
        </div>
        <div class="form-group" v-if="form.switch.description.video">
            <label>Định danh video trên youtube <span class="text-danger">*</span></label>
            <input v-model="form.description.video" type="text" class="form-control" placeholder="Vui lòng nhập">
            <p class="text-danger help-block" v-if="form.errors.description.video">{{ form.errors.description.video }}</p>
        </div>
        <div class="form-group" v-if="form.switch.description.image">
            <label>Chọn hình ảnh <span class="text-danger">*</span></label>
            <input type="file" @change="onFileChange" class="form-control" placeholder="Vui lòng nhập">
            <p class="text-danger help-block" v-if="form.errors.description.image">{{ form.errors.description.image }}</p>
        </div>
        <div v-if="form.description.type != 0" class="form-group media">
            <img v-if="form.description.image" :src="form.description.image">
            <iframe v-if="form.description.video" :src="'https://www.youtube.com/embed/'+form.description.video" ></iframe>
            <p class="text-center remove"><span @click="removeValueDescription" class="text-danger">--- Xóa nội dung ---</span></p>
        </div>
        <div class="form-actions">
            <router-link :to="{name: 'threads.listing'}" class="btn btn-form btn-default btn-large">Hủy bỏ</router-link>
            <span @click="update" type="submit" class="btn btn-form btn-primary btn-large">Cập nhật</span>
        </div>
    </form>
</template>

<script>
export default {
    data: () => ({
        threads_now: null,
        form: {
            title: null,
            password: null,
            description: {
                type: 0,
                video: null,
                image: null
            },
            switch: {
                description: {
                    image: false,
                    video: false,
                }
            },
            errors: {}
        },
    }),
    watch: {
        'form.description.type': function(_new) {
            this.form.switch.description.video = false
            this.form.switch.description.image = false
            this.removeValueDescription()
            switch(Number(_new)) {
                case 1:
                    this.form.switch.description.image = true
                break
                case 2:
                    this.form.switch.description.video = true
            }
        }
    },
    created() {
        this.threads_id = this.$route.params.id
        this.getData()
        this.resetFormErrors()
    },
    methods: {
        async getData() {
            this.threads_now = await this.$db.Threads.asyncFindOne({ _id: this.threads_id })
            this.$options.parent.setTitle(`Cập nhật đề "${this.threads_now.title}"`)
            this.form.title = this.threads_now.title
            this.form.password = this.threads_now.password
            this.form.description.type = this.threads_now.description.type

            if(this.threads_now.description.type == 1) {
                this.form.description.image = (await this.$db.Media.asyncFindOne({ _id: this.threads_now.description.image})).base64
            } else {
                this.form.description.video = this.threads_now.description.video
            }
        },
        removeValueDescription() {
            if(Number(this.form.description.type) == 1)
                this.form.description.video = null
            else 
                this.form.description.image = null
        },
        onFileChange(e) {
            var files = e.target.files || e.dataTransfer.files
            if (!files.length)
                return;

            // Lấy ra base 64 của image đầu 
            var image = new Image()
            var reader = new FileReader()
            var vm = this;

            reader.onload = (e) => {
                vm.form.description.image = e.target.result
            }
            reader.readAsDataURL(files[0])
        },
        resetFormErrors() {
            this.form.errors = {
                title: null,
                description: {
                    type: null,
                    video: null,
                    image: null
                }
            }
        },
        valiadted() {
            this.resetFormErrors()
            let pass = true;
            if(this.form.title == null) {
                pass = false
                this.form.errors.title = 'Vui lòng nhập thông tin'
            }

            if(this.form.description.type == 1 && this.form.description.image == null) {
                pass = false
                this.form.errors.description.image = 'Vui lòng chọn một ảnh'
            } else if(this.form.description.type == 2 && this.form.description.video == null) {
                pass = false
                this.form.errors.description.video = 'Vui lòng nhập định danh video'
            }
            return pass
        },
        async update() {

            if(this.valiadted()) {
                const os = require('os')
                let timestamp = Date.now();
                var data_update = {
                    title: this.form.title,
                    password: this.form.password,
                    description: {
                        type: this.form.description.type
                    },
                    created_at: this.threads_now.created_at,
                    updated_at: os.userInfo().username,
                    created_time: this.threads_now.created_time,
                    updated_time: timestamp,
                }
                if(this.form.description.type == 1) {
                    data_update.description.image = (await this.$db.Media.asyncInsert({
                            base64: this.form.description.image
                        }))._id
                } else {
                    data_update.description.video = this.form.description.video
                }
                this.$db.Threads.asyncUpdate({ _id: this.threads_id }, data_update).then(doc => {
                    this.$options.parent.writeLog(2, this.threads_id, `Đã cập nhật đề "${data_update.title}"`)
                    if(!confirm('Cập nhật thành công, bạn có muốn tiếp tục chỉnh sửa không?')) {
                        this.$router.push({ name: "threads.listing"})
                    }
                })
            }
        }
    }
}
</script>