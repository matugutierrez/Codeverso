function lang(opts) {
  return Object.assign({
    category: 'Otros',
    indentUnit: 'spaces',
    indentSize: 2,
    lineComment: null,
    blockCommentStart: null,
    blockCommentEnd: null,
    strings: ['"', "'"],
    keywords: [],
    types: [],
    accent: '#7c5cff',
    increaseIndentAfter: ['{', '(', '['],
    decreaseIndentBefore: ['}', ')', ']'],
    autoClosePairs: [['{', '}'], ['(', ')'], ['[', ']'], ['"', '"'], ["'", "'"]],
    extension: 'txt'
  }, opts)
}

const rich = [
  lang({ slug: 'c', name: 'C', category: 'Sistemas', indentUnit: 'spaces', indentSize: 4, lineComment: '//', blockCommentStart: '/*', blockCommentEnd: '*/', keywords: ['int','char','float','double','void','if','else','for','while','do','switch','case','break','continue','return','struct','typedef','sizeof','static','const','unsigned','signed','long','short','enum','union','goto','extern','volatile','include','define'], accent: '#5c6bc0', extension: 'c' }),
  lang({ slug: 'cpp', name: 'C++', category: 'Sistemas', indentUnit: 'spaces', indentSize: 4, lineComment: '//', blockCommentStart: '/*', blockCommentEnd: '*/', keywords: ['class','public','private','protected','virtual','override','template','typename','namespace','using','new','delete','this','try','catch','throw','const','static','void','int','bool','auto','return','if','else','for','while','include','std','cout','cin','vector','string'], accent: '#6c7fe0', extension: 'cpp' }),
  lang({ slug: 'csharp', name: 'C#', category: 'Backend', indentUnit: 'spaces', indentSize: 4, lineComment: '//', blockCommentStart: '/*', blockCommentEnd: '*/', keywords: ['using','namespace','class','public','private','protected','static','void','int','string','bool','var','new','return','if','else','for','foreach','while','try','catch','interface','override','async','await'], accent: '#a06bff', extension: 'cs' }),
  lang({ slug: 'java', name: 'Java', category: 'Backend', indentUnit: 'spaces', indentSize: 4, lineComment: '//', blockCommentStart: '/*', blockCommentEnd: '*/', keywords: ['public','private','protected','class','interface','extends','implements','static','void','int','String','boolean','new','return','if','else','for','while','try','catch','import','package','this','super','final'], accent: '#e07a5f', extension: 'java' }),
  lang({ slug: 'python', name: 'Python', category: 'General', indentUnit: 'spaces', indentSize: 4, lineComment: '#', strings: ['"', "'", '"""'], keywords: ['def','class','import','from','as','if','elif','else','for','while','try','except','finally','with','return','yield','lambda','pass','break','continue','and','or','not','in','is','None','True','False','self'], accent: '#3fb950', increaseIndentAfter: [':'], decreaseIndentBefore: [], autoClosePairs: [['(', ')'], ['[', ']'], ['{', '}'], ['"', '"'], ["'", "'"]], extension: 'py' }),
  lang({ slug: 'javascript', name: 'JavaScript', category: 'Web', indentUnit: 'spaces', indentSize: 2, lineComment: '//', blockCommentStart: '/*', blockCommentEnd: '*/', strings: ['"', "'", '`'], keywords: ['const','let','var','function','return','if','else','for','while','switch','case','break','continue','class','extends','new','this','import','export','default','async','await','try','catch','typeof','null','undefined','true','false'], accent: '#f7df1e', extension: 'js' }),
  lang({ slug: 'typescript', name: 'TypeScript', category: 'Web', indentUnit: 'spaces', indentSize: 2, lineComment: '//', blockCommentStart: '/*', blockCommentEnd: '*/', strings: ['"', "'", '`'], keywords: ['interface','type','const','let','var','function','return','if','else','for','while','class','extends','implements','new','this','import','export','default','async','await','public','private','readonly','enum'], accent: '#3178c6', extension: 'ts' }),
  lang({ slug: 'html', name: 'HTML', category: 'Web', indentUnit: 'spaces', indentSize: 2, blockCommentStart: '<!--', blockCommentEnd: '-->', strings: ['"', "'"], keywords: ['html','head','body','div','span','class','id','href','src','script','style','meta','link','title','a','img','ul','li','table','tr','td'], accent: '#e34f26', increaseIndentAfter: ['<'], decreaseIndentBefore: ['</'], autoClosePairs: [['<', '>'], ['"', '"'], ["'", "'"]], extension: 'html' }),
  lang({ slug: 'css', name: 'CSS', category: 'Web', indentUnit: 'spaces', indentSize: 2, lineComment: null, blockCommentStart: '/*', blockCommentEnd: '*/', keywords: ['color','background','margin','padding','display','flex','grid','position','width','height','border','font-size','important','hover','media'], accent: '#264de4', increaseIndentAfter: ['{'], decreaseIndentBefore: ['}'], autoClosePairs: [['{', '}'], ['(', ')'], ['"', '"'], ["'", "'"]], extension: 'css' }),
  lang({ slug: 'sql', name: 'SQL', category: 'Datos', indentUnit: 'spaces', indentSize: 2, lineComment: '--', blockCommentStart: '/*', blockCommentEnd: '*/', keywords: ['SELECT','FROM','WHERE','JOIN','INNER','LEFT','RIGHT','GROUP','BY','ORDER','HAVING','INSERT','INTO','VALUES','UPDATE','SET','DELETE','CREATE','TABLE','ALTER','DROP','PRIMARY','KEY','FOREIGN','REFERENCES','AND','OR','NOT','NULL','AS','DISTINCT'], accent: '#00758f', extension: 'sql' }),
  lang({ slug: 'go', name: 'Go', category: 'Backend', indentUnit: 'tabs', indentSize: 1, lineComment: '//', blockCommentStart: '/*', blockCommentEnd: '*/', keywords: ['func','package','import','var','const','type','struct','interface','return','if','else','for','range','switch','case','go','chan','defer','nil','true','false'], accent: '#00add8', extension: 'go' }),
  lang({ slug: 'rust', name: 'Rust', category: 'Sistemas', indentUnit: 'spaces', indentSize: 4, lineComment: '//', blockCommentStart: '/*', blockCommentEnd: '*/', keywords: ['fn','let','mut','const','struct','enum','impl','trait','pub','use','mod','match','if','else','for','while','loop','return','self','Self','true','false','None','Some'], accent: '#dea584', extension: 'rs' }),
  lang({ slug: 'ruby', name: 'Ruby', category: 'Backend', indentUnit: 'spaces', indentSize: 2, lineComment: '#', keywords: ['def','end','class','module','if','elsif','else','unless','while','until','do','begin','rescue','ensure','yield','return','nil','true','false','self','require','attr_accessor'], accent: '#cc342d', increaseIndentAfter: ['do', 'then'], decreaseIndentBefore: ['end'], extension: 'rb' }),
  lang({ slug: 'php', name: 'PHP', category: 'Backend', indentUnit: 'spaces', indentSize: 4, lineComment: '//', blockCommentStart: '/*', blockCommentEnd: '*/', keywords: ['function','echo','if','else','elseif','foreach','while','for','class','public','private','protected','return','require','include','namespace','use','new','static','array','true','false','null'], accent: '#777bb4', extension: 'php' }),
  lang({ slug: 'swift', name: 'Swift', category: 'Movil', indentUnit: 'spaces', indentSize: 4, lineComment: '//', blockCommentStart: '/*', blockCommentEnd: '*/', keywords: ['func','var','let','class','struct','enum','protocol','extension','if','else','guard','for','while','switch','case','return','import','true','false','nil','self'], accent: '#fa7343', extension: 'swift' }),
  lang({ slug: 'kotlin', name: 'Kotlin', category: 'Movil', indentUnit: 'spaces', indentSize: 4, lineComment: '//', blockCommentStart: '/*', blockCommentEnd: '*/', keywords: ['fun','val','var','class','object','interface','if','else','for','while','when','return','import','package','true','false','null','this'], accent: '#a97bff', extension: 'kt' }),
  lang({ slug: 'dart', name: 'Dart', category: 'Movil', indentUnit: 'spaces', indentSize: 2, lineComment: '//', blockCommentStart: '/*', blockCommentEnd: '*/', keywords: ['void','var','final','const','class','extends','implements','if','else','for','while','return','import','true','false','null','this','async','await'], accent: '#0175c2', extension: 'dart' }),
  lang({ slug: 'r', name: 'R', category: 'Datos', indentUnit: 'spaces', indentSize: 2, lineComment: '#', keywords: ['function','if','else','for','while','repeat','return','library','TRUE','FALSE','NULL','NA'], accent: '#276dc3', extension: 'r' }),
  lang({ slug: 'matlab', name: 'MATLAB', category: 'Datos', indentUnit: 'spaces', indentSize: 4, lineComment: '%', keywords: ['function','end','if','else','elseif','for','while','return','true','false','disp','plot'], accent: '#e16737', increaseIndentAfter: [], decreaseIndentBefore: ['end'], extension: 'm' }),
  lang({ slug: 'perl', name: 'Perl', category: 'Scripting', indentUnit: 'spaces', indentSize: 4, lineComment: '#', keywords: ['my','sub','if','else','elsif','unless','while','for','foreach','return','use','package','print','undef'], accent: '#39457e', extension: 'pl' }),
  lang({ slug: 'lua', name: 'Lua', category: 'Scripting', indentUnit: 'spaces', indentSize: 2, lineComment: '--', blockCommentStart: '--[[', blockCommentEnd: ']]', keywords: ['function','end','local','if','then','else','elseif','for','while','do','return','true','false','nil'], accent: '#000080', increaseIndentAfter: ['then', 'do'], decreaseIndentBefore: ['end'], extension: 'lua' }),
  lang({ slug: 'haskell', name: 'Haskell', category: 'Funcional', indentUnit: 'spaces', indentSize: 2, lineComment: '--', blockCommentStart: '{-', blockCommentEnd: '-}', keywords: ['let','in','where','if','then','else','case','of','data','type','class','instance','do','module','import'], accent: '#5e5086', extension: 'hs' }),
  lang({ slug: 'scala', name: 'Scala', category: 'Backend', indentUnit: 'spaces', indentSize: 2, lineComment: '//', blockCommentStart: '/*', blockCommentEnd: '*/', keywords: ['def','val','var','class','object','trait','extends','with','if','else','for','while','match','case','return','import','true','false','null'], accent: '#dc322f', extension: 'scala' }),
  lang({ slug: 'bash', name: 'Bash / Shell', category: 'Scripting', indentUnit: 'spaces', indentSize: 2, lineComment: '#', keywords: ['if','then','else','elif','fi','for','in','do','done','while','function','echo','export','case','esac','return'], accent: '#4eaa25', increaseIndentAfter: ['then', 'do'], decreaseIndentBefore: ['fi', 'done'], extension: 'sh' }),
  lang({ slug: 'powershell', name: 'PowerShell', category: 'Scripting', indentUnit: 'spaces', indentSize: 4, lineComment: '#', blockCommentStart: '<#', blockCommentEnd: '#>', keywords: ['function','param','if','else','elseif','foreach','while','return','Write-Host','Get-ChildItem','$true','$false','$null'], accent: '#012456', extension: 'ps1' }),
  lang({ slug: 'assembly', name: 'Assembly (x86)', category: 'Sistemas', indentUnit: 'spaces', indentSize: 4, lineComment: ';', keywords: ['mov','add','sub','jmp','cmp','je','jne','push','pop','call','ret','section','global','db','dw','dd'], accent: '#6e4c13', extension: 'asm' }),
  lang({ slug: 'cobol', name: 'COBOL', category: 'Legado', indentUnit: 'spaces', indentSize: 4, lineComment: '*', keywords: ['IDENTIFICATION','DIVISION','PROGRAM-ID','PROCEDURE','DATA','WORKING-STORAGE','MOVE','DISPLAY','PERFORM','STOP','RUN'], accent: '#8b8b8b', extension: 'cob' }),
  lang({ slug: 'fortran', name: 'Fortran', category: 'Legado', indentUnit: 'spaces', indentSize: 4, lineComment: '!', keywords: ['PROGRAM','END','SUBROUTINE','FUNCTION','IF','THEN','ELSE','DO','WHILE','INTEGER','REAL','PRINT'], accent: '#734f96', extension: 'f90' }),
  lang({ slug: 'pascal', name: 'Pascal', category: 'Legado', indentUnit: 'spaces', indentSize: 2, lineComment: '//', blockCommentStart: '{', blockCommentEnd: '}', keywords: ['program','begin','end','var','if','then','else','for','while','do','function','procedure','writeln','readln'], accent: '#e3382e', increaseIndentAfter: ['begin'], decreaseIndentBefore: ['end'], extension: 'pas' }),
  lang({ slug: 'objectivec', name: 'Objective-C', category: 'Movil', indentUnit: 'spaces', indentSize: 4, lineComment: '//', blockCommentStart: '/*', blockCommentEnd: '*/', keywords: ['@interface','@implementation','@property','@end','if','else','for','while','return','id','nil','self','super'], accent: '#438eff', extension: 'm' }),
  lang({ slug: 'elixir', name: 'Elixir', category: 'Funcional', indentUnit: 'spaces', indentSize: 2, lineComment: '#', keywords: ['def','defmodule','do','end','if','else','unless','case','cond','true','false','nil'], accent: '#6e4a7e', increaseIndentAfter: ['do'], decreaseIndentBefore: ['end'], extension: 'ex' }),
  lang({ slug: 'erlang', name: 'Erlang', category: 'Funcional', indentUnit: 'spaces', indentSize: 4, lineComment: '%', keywords: ['module','export','if','case','of','end','fun','receive','true','false'], accent: '#a90533', extension: 'erl' }),
  lang({ slug: 'clojure', name: 'Clojure', category: 'Funcional', indentUnit: 'spaces', indentSize: 2, lineComment: ';', keywords: ['def','defn','let','if','do','fn','true','false','nil'], accent: '#5881d8', extension: 'clj' }),
  lang({ slug: 'fsharp', name: 'F#', category: 'Funcional', indentUnit: 'spaces', indentSize: 4, lineComment: '//', blockCommentStart: '(*', blockCommentEnd: '*)', keywords: ['let','if','then','else','match','with','type','module','open','true','false'], accent: '#378bba', extension: 'fs' }),
  lang({ slug: 'vbnet', name: 'Visual Basic .NET', category: 'Backend', indentUnit: 'spaces', indentSize: 4, lineComment: "'", keywords: ['Dim','If','Then','Else','End','Sub','Function','For','Next','While','Return','True','False','Nothing'], accent: '#945db7', extension: 'vb' }),
  lang({ slug: 'groovy', name: 'Groovy', category: 'Backend', indentUnit: 'spaces', indentSize: 4, lineComment: '//', blockCommentStart: '/*', blockCommentEnd: '*/', keywords: ['def','class','if','else','for','while','return','import','true','false','null'], accent: '#4298b8', extension: 'groovy' }),
  lang({ slug: 'julia', name: 'Julia', category: 'Datos', indentUnit: 'spaces', indentSize: 4, lineComment: '#', keywords: ['function','end','if','else','elseif','for','while','return','true','false','nothing'], accent: '#9558b2', decreaseIndentBefore: ['end'], extension: 'jl' }),
  lang({ slug: 'scheme', name: 'Scheme', category: 'Funcional', indentUnit: 'spaces', indentSize: 2, lineComment: ';', keywords: ['define','lambda','if','cond','let','begin','true','false'], accent: '#1e4aec', extension: 'scm' }),
  lang({ slug: 'lisp', name: 'Common Lisp', category: 'Funcional', indentUnit: 'spaces', indentSize: 2, lineComment: ';', keywords: ['defun','let','if','cond','setq','progn','t','nil'], accent: '#3fb68b', extension: 'lisp' }),
  lang({ slug: 'prolog', name: 'Prolog', category: 'Logico', indentUnit: 'spaces', indentSize: 4, lineComment: '%', keywords: [':-','if','then','else','true','false','fail'], accent: '#74283c', extension: 'pl' }),
  lang({ slug: 'solidity', name: 'Solidity', category: 'Blockchain', indentUnit: 'spaces', indentSize: 4, lineComment: '//', blockCommentStart: '/*', blockCommentEnd: '*/', keywords: ['contract','function','public','private','view','returns','if','else','for','while','mapping','address','uint','require'], accent: '#363636', extension: 'sol' }),
  lang({ slug: 'yaml', name: 'YAML', category: 'Config', indentUnit: 'spaces', indentSize: 2, lineComment: '#', keywords: [], accent: '#cb171e', increaseIndentAfter: [':'], extension: 'yml' }),
  lang({ slug: 'json', name: 'JSON', category: 'Config', indentUnit: 'spaces', indentSize: 2, keywords: ['true','false','null'], accent: '#5b5b5b', extension: 'json' }),
  lang({ slug: 'xml', name: 'XML', category: 'Config', indentUnit: 'spaces', indentSize: 2, blockCommentStart: '<!--', blockCommentEnd: '-->', keywords: [], accent: '#0060ac', increaseIndentAfter: ['<'], decreaseIndentBefore: ['</'], extension: 'xml' }),
  lang({ slug: 'markdown', name: 'Markdown', category: 'Documentacion', indentUnit: 'spaces', indentSize: 2, keywords: [], accent: '#083fa1', extension: 'md' }),
  lang({ slug: 'graphql', name: 'GraphQL', category: 'Web', indentUnit: 'spaces', indentSize: 2, lineComment: '#', keywords: ['query','mutation','type','input','enum','interface','fragment','true','false','null'], accent: '#e10098', extension: 'graphql' }),
  lang({ slug: 'dockerfile', name: 'Dockerfile', category: 'DevOps', indentUnit: 'spaces', indentSize: 2, lineComment: '#', keywords: ['FROM','RUN','CMD','COPY','ADD','ENV','EXPOSE','WORKDIR','ENTRYPOINT','ARG'], accent: '#0db7ed', extension: 'dockerfile' }),
  lang({ slug: 'hcl', name: 'Terraform (HCL)', category: 'DevOps', indentUnit: 'spaces', indentSize: 2, lineComment: '#', keywords: ['resource','provider','variable','output','module','if','for'], accent: '#5c4ee5', extension: 'tf' }),
  lang({ slug: 'vue', name: 'Vue (SFC)', category: 'Web', indentUnit: 'spaces', indentSize: 2, blockCommentStart: '<!--', blockCommentEnd: '-->', keywords: ['template','script','style','export','default','data','methods','computed','props'], accent: '#42b883', extension: 'vue' }),
  lang({ slug: 'jsx', name: 'JSX', category: 'Web', indentUnit: 'spaces', indentSize: 2, lineComment: '//', blockCommentStart: '/*', blockCommentEnd: '*/', keywords: ['const','function','return','import','export','default','useState','useEffect','props'], accent: '#61dafb', extension: 'jsx' }),
  lang({ slug: 'tsx', name: 'TSX', category: 'Web', indentUnit: 'spaces', indentSize: 2, lineComment: '//', blockCommentStart: '/*', blockCommentEnd: '*/', keywords: ['interface','const','function','return','import','export','default','useState','useEffect','props'], accent: '#3178c6', extension: 'tsx' }),
  lang({ slug: 'scss', name: 'SCSS', category: 'Web', indentUnit: 'spaces', indentSize: 2, lineComment: '//', blockCommentStart: '/*', blockCommentEnd: '*/', keywords: ['mixin','include','extend','if','else','each','for','while','variable'], accent: '#cf649a', increaseIndentAfter: ['{'], decreaseIndentBefore: ['}'], extension: 'scss' }),
  lang({ slug: 'less', name: 'LESS', category: 'Web', indentUnit: 'spaces', indentSize: 2, lineComment: '//', blockCommentStart: '/*', blockCommentEnd: '*/', keywords: ['mixin','when','and'], accent: '#1d365d', increaseIndentAfter: ['{'], decreaseIndentBefore: ['}'], extension: 'less' }),
  lang({ slug: 'nim', name: 'Nim', category: 'Sistemas', indentUnit: 'spaces', indentSize: 2, lineComment: '#', keywords: ['proc','var','let','const','if','elif','else','for','while','true','false'], accent: '#ffc200', extension: 'nim' }),
  lang({ slug: 'crystal', name: 'Crystal', category: 'Backend', indentUnit: 'spaces', indentSize: 2, lineComment: '#', keywords: ['def','end','class','module','if','elsif','else','while','true','false','nil'], accent: '#000100', decreaseIndentBefore: ['end'], extension: 'cr' }),
  lang({ slug: 'ocaml', name: 'OCaml', category: 'Funcional', indentUnit: 'spaces', indentSize: 2, lineComment: '(*', keywords: ['let','if','then','else','match','with','type','module','true','false'], accent: '#3be133', extension: 'ml' }),
  lang({ slug: 'racket', name: 'Racket', category: 'Funcional', indentUnit: 'spaces', indentSize: 2, lineComment: ';', keywords: ['define','lambda','if','cond','let','true','false'], accent: '#3fa1c9', extension: 'rkt' }),
  lang({ slug: 'ada', name: 'Ada', category: 'Legado', indentUnit: 'spaces', indentSize: 3, lineComment: '--', keywords: ['procedure','function','begin','end','if','then','else','loop','true','false'], accent: '#02f88c', decreaseIndentBefore: ['end'], extension: 'adb' }),
  lang({ slug: 'd', name: 'D', category: 'Sistemas', indentUnit: 'spaces', indentSize: 4, lineComment: '//', blockCommentStart: '/*', blockCommentEnd: '*/', keywords: ['void','int','class','struct','if','else','for','while','return','import','true','false'], accent: '#ba595e', extension: 'd' }),
  lang({ slug: 'zig', name: 'Zig', category: 'Sistemas', indentUnit: 'spaces', indentSize: 4, lineComment: '//', keywords: ['fn','var','const','if','else','for','while','return','true','false'], accent: '#f7a41d', extension: 'zig' }),
  lang({ slug: 'v', name: 'V', category: 'Sistemas', indentUnit: 'spaces', indentSize: 4, lineComment: '//', keywords: ['fn','mut','if','else','for','return','true','false'], accent: '#5d87bf', extension: 'v' }),
  lang({ slug: 'elm', name: 'Elm', category: 'Web', indentUnit: 'spaces', indentSize: 4, lineComment: '--', keywords: ['module','import','type','let','in','case','of','if','then','else'], accent: '#60b5cc', extension: 'elm' }),
  lang({ slug: 'purescript', name: 'PureScript', category: 'Funcional', indentUnit: 'spaces', indentSize: 2, lineComment: '--', keywords: ['module','import','let','in','case','of','if','then','else'], accent: '#1d222d', extension: 'purs' }),
  lang({ slug: 'reasonml', name: 'ReasonML', category: 'Funcional', indentUnit: 'spaces', indentSize: 2, lineComment: '//', keywords: ['let','if','else','switch','type','module','true','false'], accent: '#dd4b39', extension: 're' }),
  lang({ slug: 'coffeescript', name: 'CoffeeScript', category: 'Web', indentUnit: 'spaces', indentSize: 2, lineComment: '#', keywords: ['class','if','else','unless','for','while','return','true','false'], accent: '#244776', increaseIndentAfter: [':'], extension: 'coffee' }),
  lang({ slug: 'actionscript', name: 'ActionScript', category: 'Web', indentUnit: 'spaces', indentSize: 4, lineComment: '//', blockCommentStart: '/*', blockCommentEnd: '*/', keywords: ['function','class','public','private','if','else','for','while','return','true','false'], accent: '#882b0f', extension: 'as' }),
  lang({ slug: 'delphi', name: 'Delphi', category: 'Legado', indentUnit: 'spaces', indentSize: 2, lineComment: '//', blockCommentStart: '{', blockCommentEnd: '}', keywords: ['program','begin','end','var','if','then','else','for','while','procedure','function'], accent: '#b0ce4e', decreaseIndentBefore: ['end'], extension: 'pas' }),
  lang({ slug: 'smalltalk', name: 'Smalltalk', category: 'Legado', indentUnit: 'spaces', indentSize: 4, lineComment: '"', keywords: ['class','method','if','true','false'], accent: '#596706', extension: 'st' }),
  lang({ slug: 'tcl', name: 'Tcl', category: 'Scripting', indentUnit: 'spaces', indentSize: 4, lineComment: '#', keywords: ['proc','if','else','for','while','set','return','true','false'], accent: '#e4cc98', extension: 'tcl' }),
  lang({ slug: 'awk', name: 'AWK', category: 'Scripting', indentUnit: 'spaces', indentSize: 2, lineComment: '#', keywords: ['BEGIN','END','if','else','for','while','print'], accent: '#1a5f3c', extension: 'awk' }),
  lang({ slug: 'verilog', name: 'Verilog', category: 'Hardware', indentUnit: 'spaces', indentSize: 2, lineComment: '//', blockCommentStart: '/*', blockCommentEnd: '*/', keywords: ['module','endmodule','wire','reg','always','if','else','begin','end'], accent: '#b2b7f8', decreaseIndentBefore: ['end'], extension: 'v' }),
  lang({ slug: 'vhdl', name: 'VHDL', category: 'Hardware', indentUnit: 'spaces', indentSize: 2, lineComment: '--', keywords: ['entity','architecture','begin','end','if','then','else','process'], accent: '#adb2cb', decreaseIndentBefore: ['end'], extension: 'vhd' }),
  lang({ slug: 'arduino', name: 'Arduino (C++)', category: 'Hardware', indentUnit: 'spaces', indentSize: 2, lineComment: '//', blockCommentStart: '/*', blockCommentEnd: '*/', keywords: ['void','setup','loop','int','pinMode','digitalWrite','digitalRead','delay','true','false'], accent: '#00979d', extension: 'ino' }),
  lang({ slug: 'batch', name: 'Batch (.bat)', category: 'Scripting', indentUnit: 'spaces', indentSize: 2, lineComment: 'REM', keywords: ['echo','set','if','else','for','goto','call'], accent: '#c1f12e', extension: 'bat' }),
  lang({ slug: 'makefile', name: 'Makefile', category: 'DevOps', indentUnit: 'tabs', indentSize: 1, lineComment: '#', keywords: [], accent: '#427819', extension: 'mk' }),
  lang({ slug: 'toml', name: 'TOML', category: 'Config', indentUnit: 'spaces', indentSize: 2, lineComment: '#', keywords: [], accent: '#9c4221', extension: 'toml' }),
  lang({ slug: 'ini', name: 'INI', category: 'Config', indentUnit: 'spaces', indentSize: 2, lineComment: ';', keywords: [], accent: '#6d6d6d', extension: 'ini' }),
  lang({ slug: 'protobuf', name: 'Protocol Buffers', category: 'Config', indentUnit: 'spaces', indentSize: 2, lineComment: '//', keywords: ['message','service','rpc','repeated','optional','required'], accent: '#4d4d4d', extension: 'proto' }),
  lang({ slug: 'apex', name: 'Apex (Salesforce)', category: 'Backend', indentUnit: 'spaces', indentSize: 4, lineComment: '//', blockCommentStart: '/*', blockCommentEnd: '*/', keywords: ['public','private','class','if','else','for','while','return','true','false'], accent: '#2090c3', extension: 'cls' }),
  lang({ slug: 'abap', name: 'ABAP', category: 'Legado', indentUnit: 'spaces', indentSize: 2, lineComment: '*', keywords: ['DATA','IF','ELSE','ENDIF','LOOP','ENDLOOP','WRITE'], accent: '#e8274b', decreaseIndentBefore: ['ENDIF', 'ENDLOOP'], extension: 'abap' })
]

const categories = {
  Esoterico: ['Brainfuck', 'Whitespace', 'LOLCODE', 'Malbolge', 'Befunge', 'Piet', 'INTERCAL', 'Shakespeare', 'Chef', 'Ook!'],
  Historico: ['ALGOL', 'Simula', 'PL/I', 'Modula-2', 'B', 'BCPL', 'CPL', 'Speedcode', 'Autocode', 'JOVIAL'],
  Investigacion: ['Idris', 'Agda', 'Coq', 'Lean', 'Isabelle', 'Mercury', 'Curry', 'Miranda', 'Hope', 'Epigram'],
  ArraysYVectores: ['APL', 'J', 'K', 'Q (kdb+)', 'GNU Octave', 'Chapel', 'Futhark'],
  Concatenativo: ['Forth', 'Factor', 'PostScript', 'Joy', 'Cat'],
  Visual: ['Scratch', 'Blockly', 'LabVIEW', 'Simulink', 'Node-RED'],
  Bases_de_datos: ['PL/SQL', 'T-SQL', 'PL/pgSQL', 'MySQL', 'SQLite dialect', 'Cypher', 'SPARQL', 'DAX', 'MDX', 'N1QL'],
  Templating: ['Handlebars', 'Mustache', 'Liquid', 'Jinja2', 'EJS', 'Twig', 'ERB', 'Pug', 'Haml', 'Thymeleaf', 'Blade', 'Razor'],
  Configuracion: ['CSV', 'EDN', 'Properties', 'Env', 'Nginx config', 'Apache config', 'CMake', 'Gradle (Groovy DSL)', 'Bazel (Starlark)'],
  Cientifico: ['Mathematica', 'Maple', 'Sage', 'Stan', 'BUGS', 'GAMS', 'AMPL'],
  Educativo: ['Logo', 'Alice', 'Snap!', 'Karel', 'Processing', 'p5.js'],
  Legado_adicional: ['RPG', 'PL/M', 'CLIST', 'REXX', 'Natural', 'Occam', 'Eiffel', 'Nemerle', 'Boo', 'Io', 'Self', 'Squeak', 'Oz', 'Mozart', 'Miva', 'ColdFusion', 'PowerBuilder', 'MUMPS', 'Ceylon', 'Fantom', 'Vala', 'Genie', 'Monkey X', 'Haxe', 'Squirrel', 'AngelScript', 'Boo', 'Gambas', 'Xtend', 'Wren', 'Red', 'Rebol', 'Pike', 'Falcon', 'Lasso', 'Turing', 'Alma-0', 'SETL', 'Snobol', 'Icon', 'Unicon', 'Dylan', 'Goo', 'Slate', 'Ioke', 'Seph', 'Ola'],
  Blockchain_adicional: ['Vyper', 'Move', 'Cairo', 'Michelson', 'Clarity', 'Scilla', 'Simplicity'],
  Shaders: ['GLSL', 'HLSL', 'WGSL', 'Cg', 'Metal Shading Language'],
  Consultas_adicionales: ['JQ', 'JSONata', 'XPath', 'XQuery', 'OQL']
}

let counter = 1
const richSlugs = new Set(rich.map((l) => l.slug))
const generic = []

Object.keys(categories).forEach((catKey) => {
  const label = catKey.replace(/_/g, ' ')
  categories[catKey].forEach((name) => {
    const slug = 'gen-' + name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    if (richSlugs.has(slug)) return
    generic.push(lang({ slug, name, category: label, extension: 'txt' }))
  })
})

const all = rich.concat(generic)

function getBySlug(slug) {
  return all.find((l) => l.slug === slug) || null
}

module.exports = { languages: all, getBySlug }
