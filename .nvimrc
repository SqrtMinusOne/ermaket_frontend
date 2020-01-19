let g:vue_pre_processors = ['typescript']
set shiftwidth=2
let g:ale_typescript_tslint_use_global = 0
let g:ale_history_log_output = 1
let g:ale_typescript_tslint_config_path = 'tslint.json'

let g:ale_fixers = {
            \    'javascript': ['prettier', 'eslint'],
            \    'typescript': ['prettier', 'tslint'],
            \    'vue': ['prettier', 'eslint'],
            \    'json': ['prettier']
            \}
