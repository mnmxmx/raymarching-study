var includePattern = /^[ \t]*#include +<([\w\d./]+)>/gm;
import common from "./glsl/common-func.frag";
import snoise4 from "./glsl/snoise4.frag";

var ShaderChunk = {
    common: common,
    snoise4: snoise4
}

var resolveIncludes = ( string ) => {
	return string.replace( includePattern, includeReplacer );
}

var includeReplacer = ( match, include ) => {

    var string = ShaderChunk[ include ];  
    

	if ( string === undefined ) {
		throw new Error( 'Can not resolve #include <' + include + '>' );
    }

	return resolveIncludes( string );

}

export default function(shader){
    return resolveIncludes(shader);
}