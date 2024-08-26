const ValidateError = require('../error/ValidateError');

class Validator {

    constructor(mode = 2) {
        this.mode = mode;
    }

    validate(data, rules, message) {
        let fields = Object.keys(data);
        if(this.mode === 2) {
            fields = Object.keys(rules);
        }


        let func = {
            required: (val) => {
                if (val === '' || val === undefined || val === null) return false;
                return true;
            },
            string: (val) => {
                if (typeof val === 'string') return true;
                return false;
            },
            num:(val) => {
                if (typeof val === 'number' && !isNaN(val)) return true
                return false
            },
            number: (val) => {
                if (typeof val === 'number' && !isNaN(val)) return true
                return false
            },
            obj: (val) => {
                if(typeof val === 'object' && Object.keys(val).length > 0) return true;
                return false;
            },
            array: (val) => {
                if (Array.isArray(val)) return true;
                return false;
            },
            gt: (val, arg) => {
                val = Number(val)
                arg = Number(arg);
                if (val > arg) return true;
                return false;
            },
            gte: (val, arg) => {
                val = Number(val)
                arg = Number(arg);
                if (val >= arg) return true;
                return false;
            },
            lt: (val, arg) => {
                val = Number(val)
                arg = Number(arg);
                if (val < arg) return true;
                return false;
            },
            lte: (val, arg) => {
                val = Number(val)
                arg = Number(arg);
                if (val <= arg) return true;
                return false;
            },
            in: (val, args) => {
                let arr = args.split(',');
                let regex = /\d+/
                arr.map(v => {
                    if (regex.test(v)) {
                        return Number(v);
                    }
                })

                if (args.includes(val)) return true;
                return false;
            }
        }

        let getValidateFunc = (str) => {
            if (str.includes('required')) return 'required';
            if (str.includes('string')) return 'string';
            if (str.includes('obj')) return 'obj';
            if (str.includes("number")) return 'number';
            if (str.includes("num")) return 'number';
            if (str === 'array') return 'array';
            if (str.includes('gte')) return 'gte';
            if (str.includes('gt')) return 'gt';
            if (str.includes('lte')) return 'lte';
            if (str.includes('lt')) return 'lt';
            if (str.includes('in')) return 'in';
        }

        let flag = false;
        let failed_field;
        let failed_func;
        let failed_arg;

        for (let field of fields) {
            let rule = rules[field];
            if (!rule) continue;

            let ruleArr = rule.split('|');

            for (let obj of ruleArr) {
                failed_arg = ''
                let validateFunc = getValidateFunc(obj);
                let argsArr = obj.split(':');
                let res;
                if (argsArr.length > 1) {
                    let new_arr = argsArr.slice(1)
                    failed_arg = new_arr
                    res = func[validateFunc](data[field], ...new_arr);
                } else {
                    res = func[validateFunc](data[field]);
                }

                if (!res) {
                    flag = true;
                    failed_field = field;
                    failed_func = validateFunc;
                    break;
                }
            }

            if (flag === true) {
                break;
            }
        }

        if (flag === true) {
            if (message && message[`${failed_field}.${failed_func}`]) {
                let msg = '';
                let new_field = `${failed_field}.${failed_func}`
                msg = message[new_field] || (message[failed_field] || "validate_error");
                throw new ValidateError(msg);
            } else {
                let obj = {
                    field: failed_field,
                    type: failed_func,
                    arg: failed_arg
                }
                throw new ValidateError(obj);
            }

        }
        return true;
    }
}


module.exports = Validator;