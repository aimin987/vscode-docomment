/**
 * File: DocommentDomainDart.ts
 * -----
 * Description: 
 * -----
 * Created  By: Aim 2023-09-25 09:31:31
 * Modified By: Aim 2023-09-25 16:46:19
 * -----
 * HISTORY:
 * Date      	By	Comments
 * ----------	---	----------------------------------------------------------
 */

import { Position } from "vscode";
import { FormatterCSharp } from "../../Formatter/FormatterCSharp";
import { FormatterDart } from "../../Formatter/FormatterDart";
import { SyntacticAnalysisDart } from "../../SyntacticAnalysis/SyntacticAnalysisDart";
import { StringUtil } from "../../Utility/StringUtil";
import { DocommentDomain } from "../DocommentDomain";
import { CodeType } from "../IDocommentDomain";
import { Attribute, ConfigAdvancedCSharp } from "../../Entity/Config/Lang/ConfigAdvancedCSharp";


export class DocommentDomainDart extends DocommentDomain {

    /*-------------------------------------------------------------------------
     * Field
     *-----------------------------------------------------------------------*/
    private _isEnterKey: boolean = false;
    private _isInsertDocCommentLineAbove: boolean = false;

    /*-------------------------------------------------------------------------
     * Domain Method
     *-----------------------------------------------------------------------*/
    /* @override */
    public Init() {
        this._isEnterKey = false;
        this._isInsertDocCommentLineAbove = false;
    }

    /* @override */
    public IsTriggerDocomment(): boolean {

        const eventText: string = this._event?.text;
        if (eventText == null || eventText === '') {
            return false;
        }

        // NG: ActiveChar is NULL
        const activeChar: string = this._vsCodeApi.ReadCharAtCurrent();
        if (activeChar == null) {
            return false;
        }

        const isAfterDocomment = SyntacticAnalysisDart.IsAfterDocomment(eventText);
        if (isAfterDocomment) {
            return false;
        }

        const isActivationKey = SyntacticAnalysisDart.IsActivationKey(activeChar, this._config.syntax);
        if (isActivationKey) {
            return this.IsTriggerDocommentByActivationKey();
        }

        this._isEnterKey = SyntacticAnalysisDart.IsEnterKey(eventText);
        if (this._isEnterKey) {
            return this.IsTriggerDocommentByEnterKey(eventText);
        }

        return false;
    }

    /* @implements */
    public IsInScope(): boolean {
        return true;
    }

    /* @override */
    public GetCode(): string {
        const code: string = this._vsCodeApi.ReadNextCodeFromCurrent(this._config.eol);
        const removeOverride = code.split(this._config.eol).filter(line => !SyntacticAnalysisDart.IsOverride(line.trim())).join('');
        return removeOverride;
    }

    /* @override */
    public GetCodeType(code: string): CodeType {
        // If the previous line was a doc comment and we hit enter.
        // Extend the doc comment without generating anything else,
        // even if there's a method or something next line.
        if (!this._config.activateOnEnter && this._isEnterKey) {
            if (SyntacticAnalysisDart.IsDocComment(this._vsCodeApi.ReadLineAtCurrent(), this._config.syntax)) {
                return CodeType.Comment;
            }
        }

        // class
        if (SyntacticAnalysisDart.IsClass(code)) {
            return CodeType.Class;
        }

        if (SyntacticAnalysisDart.IsMethod(code)) {
            return CodeType.Method;
        }

        if (SyntacticAnalysisDart.IsField(code)) {
            return CodeType.Field;
        }

        return CodeType.None;
    }

    /* @override */
    public GeneDocomment(code: string, codeType: CodeType): string {
        let paramNameList: Array<string> = null;
        let hasReturn = false;

        if (codeType == CodeType.Method) {
            paramNameList = SyntacticAnalysisDart.GetMethodParamNameList(code);
            return this.GeneSummary(code, codeType, paramNameList, hasReturn);
        }

        return '';
    }

    public WriteDocomment(code: string, codeType: CodeType, docomment: string): void {
        const position: Position = this._vsCodeApi.GetActivePosition();

        if (codeType === CodeType.Comment) {
            const indentBaseLine: string = this._vsCodeApi.ReadLineAtCurrent();
            const indent: string = StringUtil.GetIndent(code, indentBaseLine, this._config.insertSpaces, this._config.detectIdentation);
            const indentLen: number = StringUtil.GetIndentLen(indent, this._config.syntax, this._config.insertSpaces, this._config.detectIdentation);
            const lineOffset = this._isInsertDocCommentLineAbove ? 0 : 1;
            const charOffset = this._isInsertDocCommentLineAbove ? 0 : -1;
            const insertPosition: Position = this._vsCodeApi.GetPosition(position.line + lineOffset, indentLen + charOffset);
            this._vsCodeApi.InsertText(insertPosition, docomment);
        } else {
            if (this._isEnterKey) {
                const active: Position = this._vsCodeApi.GetActivePosition();
                const anchor: Position = this._vsCodeApi.GetPosition(active.line + 1, active.character);
                const replaceSelection = this._vsCodeApi.GetSelectionByPosition(anchor, active);
                this._vsCodeApi.ReplaceText(replaceSelection, docomment);
            } else {
                const insertPosition: Position = this._vsCodeApi.ShiftPositionChar(position, 1);
                this._vsCodeApi.InsertText(insertPosition, docomment);
            }
        }
    }

    /* @implements */
    public MoveCursorTo(code: string, codeType: CodeType, docomment: string): void {
        const curPosition = this._vsCodeApi.GetActivePosition();
        const indentBaseLine: string = this._vsCodeApi.ReadLineAtCurrent();
        const indent: string = StringUtil.GetIndent(code, indentBaseLine, this._config.insertSpaces, this._config.detectIdentation);
        const indentLen: number = StringUtil.GetIndentLen(indent, this._config.syntax, this._config.insertSpaces, this._config.detectIdentation);
        const line = curPosition.line + SyntacticAnalysisDart.GetLineOffset(this._config.syntax, codeType);
        const lineOffset = this._isInsertDocCommentLineAbove ? -1 : 0;
        const character = indentLen - 1 + docomment.length;
        this._vsCodeApi.MoveSelection(line + lineOffset, character);
    }

    /*-------------------------------------------------------------------------
     * Private Method
     *-----------------------------------------------------------------------*/

    private GeneSummary(code: string, codeType: CodeType, paramNameList: Array<string>, hasReturn: boolean): string {

        let docommentList: Array<string> = new Array<string>();

        if (paramNameList != null) {
            paramNameList.forEach(name => {
                docommentList.push('* [' + name + '] ');
            });
        }

        // Format
        const indentBaseLine: string = this._vsCodeApi.ReadLineAtCurrent();
        const indent: string = StringUtil.GetIndent(code, indentBaseLine, this._config.insertSpaces, this._config.detectIdentation);

        const docomment: string = FormatterDart.Format(docommentList, indent, this._config.syntax, this._config.activateOnEnter);
        return docomment;
    }

    /**
     * /// or '/** '
     */
    private IsTriggerDocommentByActivationKey(): boolean {
        if (this._config.activateOnEnter) {
            if (!this._isEnterKey) {
                return false;
            }
        }

        const activeLine: string = this._vsCodeApi.ReadLineAtCurrent();

        // NG: '////'
        if (!SyntacticAnalysisDart.IsDocCommentStrict(activeLine, this._config.syntax)) {
            return false;
        }

        // NG: '/' => Insert => Event => ' /// '
        if (SyntacticAnalysisDart.IsDoubleDocComment(activeLine, this._config.syntax)) {
            return false;
        }

        return true;
    }

    private IsTriggerDocommentByEnterKey(eventText: string): boolean {

        const activeLine: string = this._vsCodeApi.ReadLineAtCurrent();

        // NG: '////'
        if (!SyntacticAnalysisDart.IsDocComment(activeLine, this._config.syntax)) {
            return false;
        }

        // NG: Undo comment lines with the enter key
        if (SyntacticAnalysisDart.IsDocComment(eventText, this._config.syntax)) {
            return false;
        }

        return true;
    }
}