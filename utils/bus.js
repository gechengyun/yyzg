module.exports = {
    taskList: [],
    events: {
        login: 'LOGIN_LOADED'
    },
    $on: function (event, fun) {
        if (!this.taskList || !this.taskList.length) {
            this.taskList = [];
        }
        this.taskList.push({
            event,
            fun
        })
    },
    $remove: function (event) {
        for (let i in this.taskList) {
            if (this.taskList[i] && this.taskList[i].event === event) {
                this.taskList[i] = null;
            }
        }
    },
    $emit: function (event, param, callback) {
        for (let i in this.taskList) {
            if (this.taskList[i] != null && this.taskList[i].event === event) {
                if (typeof this.taskList[i].fun === 'function') {
                    this.taskList[i].fun(param);
                }
                this.taskList[i] = null;
            }
        }
        if (typeof callback === 'function')
            callback();
    }
};
