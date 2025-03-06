import inquirer from 'inquirer'

/**
 * type: list单选，checkbox多选，input用户输入
 * config: [{message:提示标题,name:表单的name,choices:可供选择的项}]
 */
type cmdInquireType = 'list'|'checkbox'|'input'
interface IInquireConfig {
    message:string;
    name:string;
    choices:string[];
    required?:boolean;
}
export function askByCmd(type:cmdInquireType, config:IInquireConfig[]|IInquireConfig) {
	if (!['list', 'checkbox', 'input'].includes(type)) {
		console.error('仅支持的type的值为：', 'list,checkbox,input')
		return
	}
	config = Array.isArray(config) ? config : [config]
	const options = config.map((item) => {
		const { message, name, choices = [], required = true } = item
		if (type === 'input') {
			return { type, message, name, default: choices[0], required }
		} else {
			return { type, message, name, choices, required }
		}
	})
	return inquirer.prompt(options)
}

// async function run() {
//   const radioValue = await askByCmd('list', [
//     {
//       message: '选择一个选项',
//       name: 'radioValue',
//       choices: ['选项A', '选项B'],
//     },
//   ]);
//   const checkboxValue = await askByCmd('checkbox', [
//     {
//       message: '选择一个或多个选项',
//       name: 'checkboxValue',
//       choices: ['选项A', '选项B'],
//     },
//   ]);
//   const inputValue = await askByCmd('input', [
//     { message: '请输入项目名', name: 'inputValue', choices: ['my-project'] },
//   ]);

//   console.log(radioValue, checkboxValue, inputValue, 'index.js::161行');
// }

