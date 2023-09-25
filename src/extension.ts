import { ExtensionContext } from 'vscode';
import { DocommentControllerBlazor } from './Controller/Lang/DocommentControllerBlazor';
import { DocommentControllerCSharp } from './Controller/Lang/DocommentControllerCSharp';
import { DocommentDomainBlazor } from './Domain/Lang/DocommentDomainBlazor';
import { DocommentDomainCSharp } from './Domain/Lang/DocommentDomainCSharp';
import { DocommentDomainDart } from './Domain/Lang/DocommentDomainDart';
import { DocommentControllerDart } from './Controller/Lang/DocommentControllerDart';

export function activate(context: ExtensionContext) {

    {
        const domainCSharp = new DocommentDomainCSharp();
        const controllerCSharp = new DocommentControllerCSharp(domainCSharp);

        context.subscriptions.push(controllerCSharp);
        context.subscriptions.push(domainCSharp);
    }

    {
        const domainBlazor = new DocommentDomainBlazor();
        const controllerBlazor = new DocommentControllerBlazor(domainBlazor);

        context.subscriptions.push(controllerBlazor);
        context.subscriptions.push(domainBlazor);
    }

    {
        const domainDart = new DocommentDomainDart();
        const controllerDart = new DocommentControllerDart(domainDart);

        context.subscriptions.push(controllerDart);
        context.subscriptions.push(domainDart);
    }
}
