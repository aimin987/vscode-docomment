/**
 * File: SyntacticAnalysisDart.ts
 * -----
 * Description: 
 * -----
 * Created  By: Aim 2023-09-25 09:38:49
 * Modified By: Aim 2023-09-25 16:44:40
 * -----
 * HISTORY:
 * Date      	By	Comments
 * ----------	---	----------------------------------------------------------
 */

import { CodeType } from "../Domain/IDocommentDomain";
import { CommentSyntax } from "../Entity/Config/Contributes/Configuration";


export class SyntacticAnalysisDart {

    /*-------------------------------------------------------------------------
     * Public Method: Comment Type
     *-----------------------------------------------------------------------*/
    public static IsEnterKey(eventText: string): boolean {
        return (eventText.startsWith('\n') || eventText.startsWith("\r\n"));
    }

    public static IsAfterDocomment(eventText: string): boolean {
        return eventText.match(/^\n[ \t]+[\S]+/) !== null || eventText.match(/^\r\n[ \t]+[\S]+/) !== null;
    }

    public static IsActivationKey(activeChar: string, syntax: CommentSyntax): boolean {
        switch (syntax) {
            case CommentSyntax.single:
                return activeChar === '/';
            case CommentSyntax.delimited:
                return activeChar === '*';
        }
    }

    /**
     * Tests whether a line contains ONLY a doc comment and nothing else except whitespace.
     * @param activeLine The line to test.
     */
    public static IsDocCommentStrict(activeLine: string, syntax: CommentSyntax): boolean {
        switch (syntax) {
            case CommentSyntax.single:
                return activeLine.match(/^[ \t]*\/{3}[ \t]*$/) !== null; // FIXME:
            case CommentSyntax.delimited:
                return activeLine.match(/^[ \t]*\/\*{2}[ \t]*$/) !== null; // FIXME:
        }
    }

    public static IsDocComment(activeLine: string, syntax: CommentSyntax): boolean {
        switch (syntax) {
            case CommentSyntax.single:
                return activeLine.match(/\/{3}/) !== null;
            case CommentSyntax.delimited:
                return ((activeLine.match(/^[ \t]*\*{1}[^\/]/) !== null) || this.IsDocCommentStrict(activeLine, syntax));
        }
    }

    public static IsDoubleDocComment(activeLine: string, syntax: CommentSyntax): boolean {
        switch (syntax) {
            case CommentSyntax.single:
                return activeLine.match(/^[ \t]*\/{3} $/) !== null;
            case CommentSyntax.delimited:
                return activeLine.match(/^[ \t]*\*{1} $/) !== null;
        }
    }


    /*-------------------------------------------------------------------------
     * Public Method: Code
     *-----------------------------------------------------------------------*/

    public static IsOverride(code: string): boolean {
        if (code == null) {
            return false;
        }
        return code.match(/@override/) !== null;
    }


    /*-------------------------------------------------------------------------
     * Public Method: Code Type
     *-----------------------------------------------------------------------*/

    public static IsClass(code: string): boolean {
        if (code === null) return false;
        return code.match(/\bclass\b/) !== null;
    }

    public static IsField(code: string): boolean {
        if (code === null) return false;
        return code.match(/[^()]+;[ \t]*$/) !== null;
    }

    public static IsMethod(code: string): boolean {
        if (code === null) return false;
        return code.match(/[\w\S]\s+[\w\S]+\s*\(.*\)/) !== null;
    }

    public static GetCommentSyntax(syntax: CommentSyntax): string {
        switch (syntax) {
            case CommentSyntax.single:
                return '///';
            case CommentSyntax.delimited:
                return '*';
        }
    }

    public static GetGenericList(code: string): Array<string> {
        if (code === null) return null;


        return null;
    }

    public static GetMethodParamNameList(code: string): Array<string> {
        if (code === null) return null;

        const removedOptions = code.replace(/required|\{|\}/g, '');

        const params: RegExpMatchArray = removedOptions.match(/\((.+)\)/s);
        const isMatched = (params === null || params.length !== 2);
        if (isMatched) return null;

        let paramNames: Array<string> = new Array<string>();
        params[1].split(',').forEach(param => {

            const hasOptionalParam: boolean = param.match(/\S+\s+\S+\s*=/) !== null;
            const hasNoTypeInfo: boolean = param.match(/\S+\s*=/) !== null;

            let name: RegExpMatchArray = null;

            if (hasNoTypeInfo) {
                name = param.match(/(\S+)\s*=.*/);
            } else if (hasOptionalParam) {
                name = param.match(/\S+\s+(\S+)\s*=.*/);
            } else {
                name = param.match(/(\S+)\s*$/);
            }

            if (name != null && name.length == 2) {
                paramNames.push(name[1]);
            }
        });

        return paramNames;
    }


    public static GetLineOffset(syntax: CommentSyntax, codeType: CodeType) {
        switch (syntax) {
            case CommentSyntax.single:
                return 0;
            case CommentSyntax.delimited:
                switch (codeType) {
                    case CodeType.Comment:
                        return 1;
                    default:
                        return 2;
                }
        }
    }

}