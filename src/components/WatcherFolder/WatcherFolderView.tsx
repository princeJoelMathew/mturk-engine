import * as React from 'react';
import { connect, Dispatch } from 'react-redux';
import { Stack } from '@shopify/polaris';
import { WatcherFolder, RootState } from '../../types';
import { getWatcherIdsAssignedToFolder } from '../../selectors/watcherFolders';

import {
  editWatcherFolder,
  WatcherFolderAction,
  deleteWatcherFolder
} from '../../actions/watcherFolders';
import { DEFAULT_WATCHER_FOLDER_ID } from '../../constants/misc';
import WatcherFolderHeading from './WatcherFolderHeading';
import CreateWatcherForm from './CreateWatcherForm';
import WatcherFolderInfo from './WatcherFolderInfo';
import InfoCallout from './InfoCallout';
import WatcherFolderActions from './WatcherFolderActions';

interface OwnProps {
  readonly folderId: string;
}

interface Props {
  readonly folder: WatcherFolder;
  readonly assignedWatcherIds: string[];
}

interface Handlers {
  readonly onEdit: (id: string, field: 'name', value: string | number) => void;
  readonly onDeleteFolder: (id: string) => void;
}

class WatcherFolderView extends React.PureComponent<
  Props & OwnProps & Handlers,
  never
> {
  private handleDeleteFolder = () =>
    this.props.onDeleteFolder(this.props.folderId);

  public render() {
    const { folder, assignedWatcherIds, onEdit } = this.props;
    return (
      <Stack vertical>
        <WatcherFolderHeading
          title={folder.name}
          editable={folder.id !== DEFAULT_WATCHER_FOLDER_ID}
          onChange={(value: string) => onEdit(folder.id, 'name', value)}
        />
        <WatcherFolderInfo folder={folder} />
        <CreateWatcherForm folderId={folder.id} />
        <InfoCallout />
        <WatcherFolderActions
          folderId={folder.id}
          numWatchers={assignedWatcherIds.length}
          deletable={folder.id !== DEFAULT_WATCHER_FOLDER_ID}
          onDelete={this.handleDeleteFolder}
        />
      </Stack>
    );
  }
}

const mapState = (state: RootState, { folderId }: OwnProps): Props => ({
  folder: state.watcherFolders.get(folderId),
  assignedWatcherIds: getWatcherIdsAssignedToFolder(folderId)(state)
});

const mapDispatch = (dispatch: Dispatch<WatcherFolderAction>): Handlers => ({
  onEdit: (id: string, field: 'name', value: string) =>
    dispatch(editWatcherFolder(id, field, value)),
  onDeleteFolder: (id: string) => dispatch(deleteWatcherFolder(id))
});

export default connect(mapState, mapDispatch)(WatcherFolderView);
