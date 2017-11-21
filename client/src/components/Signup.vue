<template>
<div class="container">
    <div class="box auth-box">
			<h2 class="title is-4">Register Password</h2>
			<section>
            <p>Already have a password? Go ahead and login <router-link to="login">here</router-link></p>
            <br>
				<b-field label="Email">
					<b-input ref="email" v-model.trim="email" type="email" icon="email"></b-input>
				</b-field>
				<b-field label="Password">
					<b-input ref="password" v-model="password" type="password" icon="lock"></b-input>
				</b-field>
				<b-field label="Re-enter Password">
					<b-input ref="repeatPass" v-model="repeatPass" type="password" icon="lock"></b-input>
				</b-field>
                <p class="control">
                    <button v-show="!loading" v-bind:class="{ 'is-success': successLoading, 'is-dark' : !loadingComplete, 'is-danger': errorLoading}" class="button is-primary" @click="submitRegistration">                        <span>Submit</span>
                        <b-icon icon="alert" v-show="errorLoading"></b-icon>
                        <b-icon icon="check" v-show="successLoading"></b-icon>
                    </button>
                </p>
                <sync-loader class="submit-spinner" :loading="loading" :color="spinnerColor" :size="spinnerSize"></sync-loader>
			</section>
    </div>
</div>
</template>

<script>
import SyncLoader from 'vue-spinner/src/SyncLoader.vue'
import storageAvailable from 'storage-available'
import currUser from '../stores/CurrUserStore'

export default {
    name: 'register',
    components: {SyncLoader},
    data() {
        return {
            email: "",
            password: "",
            repeatPass: "",
            spinnerColor: '#7957d5',
            spinnerSize: '10px',
            loading: false,
            loadingComplete: false,
            errorLoading: false,
            successLoading: false
        }
    },
    methods: {
        submitRegistration() {
            this.loading = true;
            if(!(this.$refs.email.isValid)) {
                this.$snackbar.open({
                    message: "Invalid email format. Please fix before submitting",
                    type: "is-warning",
                    position: "is-top-right"
                });
                this.loading = false;
                return null;
            } else if(this.password !== this.repeatPass) {
                this.$snackbar.open({
                    message: "Password fields do not match. Please fix before submitting",
                    type: "is-warning",
                    position: "is-top-right"
                });
                this.loading = false
                return null;
            } else {
                this.$http.post('/auth/signup', { email: this.email, password: this.password })
                    .then(resp => {
                        this.$snackbar.open({
                            message: "Thanks for registering. Logging you in automatically",
                            type: "is-light",
                            position: "is-top-right"
                        });
                        console.log(resp);
                        this.loading = false;
                        this.loadingComplete = true;
                        this.successLoading = true;
                        const user = resp.data.response;
                        user._id = {"$oid": user._id};
                        if(storageAvailable('localStorage')) {
                            window.localStorage.setItem('currUser', JSON.stringify(user));
                        } else {
                            currUser.setUser(JSON.stringify(user));
                        }
                        this.$router.push({ name: 'tradeSubmit'});
                    })
                    .catch(err => {
                        console.log(err.response);
                        const msg = err.response.status === 500 ? err.response.data.error : "Please contact the commissioner";
                        this.$snackbar.open({
                            message: `Something went wrong. ${msg}`,
                            type: "is-warning",
                            position: "is-top-right"
                        });
                        this.loading = false;
                        this.loadingComplete = true;
                        this.errorLoading = true;
                    });
            }
        }
    }
  
}
</script>

<style>

</style>
