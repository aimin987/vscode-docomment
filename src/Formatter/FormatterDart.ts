/**
 * File: FormatterCSharp copy.ts
 * -----
 * Description: 
 * -----
 * Created  By: Aim 2023-09-25 15:11:51
 * Modified By: Aim 2023-09-25 15:15:32
 * -----
 * HISTORY:
 * Date      	By	Comments
 * ----------	---	----------------------------------------------------------
 */


import { CommentSyntax } from "../Entity/Config/Contributes/Configuration";
import { SyntacticAnalysisDart } from "../SyntacticAnalysis/SyntacticAnalysisDart";

export class FormatterDart {

    /*-------------------------------------------------------------------------
     * Public Method: Formatter
     *-----------------------------------------------------------------------*/
    public static Format(docommentList: string[], indent: string, syntax: CommentSyntax, activateOnEnter: boolean) {
        switch (syntax) {
            case CommentSyntax.single:
                return FormatterDart.FormatAsSingle(docommentList, indent, syntax);
            case CommentSyntax.delimited:
                return FormatterDart.FormatAsDelimited(docommentList, indent, syntax, activateOnEnter);
        }
    }

    /*-------------------------------------------------------------------------
     * Private Method: Formatter
     *-----------------------------------------------------------------------*/
    private static FormatAsSingle(docommentList: string[], indent: string, syntax: CommentSyntax) {
        let docomment = '\n';
        for (let i = 0; i < docommentList.length; i++) {
            docomment += indent + SyntacticAnalysisDart.GetCommentSyntax(syntax) + ' ' + docommentList[i];
            if (i !== docommentList.length - 1) {
                docomment += '\n';
            }
        }
        return docomment;
    }

    private static FormatAsDelimited(docommentList: string[], indent: string, syntax: CommentSyntax, activateOnEnter: boolean) {
        let docomment = '\n';
        for (let i = 0; i < docommentList.length; i++) {
            docomment += indent + ' ' + SyntacticAnalysisDart.GetCommentSyntax(syntax) + ' ' + docommentList[i];
            if (i !== docommentList.length - 1) {
                docomment += '\n';
            }
        }
        docomment += '\n';
        docomment += indent;
        docomment += ' */';
        return docomment;
    }

}
