import * as React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  Button,
  Input,
  Label,
  toast,
} from '@ds/ui';
import { SettingRow } from './setting-row';

export function DangerPanel({ workspaceName }: { workspaceName: string }) {
  const [typed, setTyped] = React.useState('');

  return (
    <>
      <SettingRow
        id="transfer-ownership"
        label="Transfer ownership"
        description="Hand the workspace to another admin. You will lose admin rights."
        labelled={false}
      >
        {(describedBy) => (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                id="transfer-ownership"
                variant="outline"
                aria-describedby={describedBy}
                className="text-destructive hover:text-destructive pointer-coarse:min-h-11"
              >
                Transfer ownership
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Transfer ownership?</AlertDialogTitle>
                <AlertDialogDescription>
                  Ownership will move to sarah@acme.io. You will become a regular member and cannot undo this yourself.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  variant="destructive"
                  onClick={() =>
                    toast({
                      variant: 'success',
                      title: 'Ownership transferred',
                      description: 'Ownership was transferred to sarah@acme.io. They will be notified.',
                    })
                  }
                >
                  Transfer ownership
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </SettingRow>

      <SettingRow
        id="delete-workspace"
        label="Delete workspace"
        description="Permanently remove the workspace, its members, and all data. This cannot be undone."
        labelled={false}
      >
        {(describedBy) => (
          <AlertDialog onOpenChange={(open) => !open && setTyped('')}>
            <AlertDialogTrigger asChild>
              <Button
                id="delete-workspace"
                variant="destructive"
                aria-describedby={describedBy}
                className="pointer-coarse:min-h-11"
              >
                Delete workspace
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this workspace?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently erase {workspaceName}, including members, projects, and billing history.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="space-y-2">
                <Label htmlFor="delete-confirm" className="text-sm">
                  Type <span className="font-mono font-bold">DELETE</span> to confirm
                </Label>
                <Input
                  id="delete-confirm"
                  autoComplete="off"
                  value={typed}
                  placeholder="DELETE"
                  className="font-mono"
                  error={typed !== '' && typed !== 'DELETE'}
                  onChange={(event) => setTyped(event.target.value)}
                />
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  variant="destructive"
                  disabled={typed !== 'DELETE'}
                  onClick={() => {
                    setTyped('');
                    toast({
                      variant: 'destructive',
                      title: 'Workspace deleted',
                      description: `${workspaceName} and all of its data were permanently removed.`,
                    });
                  }}
                >
                  Delete workspace
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </SettingRow>
    </>
  );
}
