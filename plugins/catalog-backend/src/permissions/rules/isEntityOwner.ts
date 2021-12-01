/*
 * Copyright 2021 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
  Entity,
  RELATION_OWNED_BY,
  stringifyEntityRef,
} from '@backstage/catalog-model';
import { getIdentityClaims } from '@backstage/plugin-auth-backend';
import { PermissionRule } from '@backstage/plugin-permission-node';
import { EntitiesSearchFilter } from '../../catalog/types';

export const isEntityOwner: PermissionRule<Entity, EntitiesSearchFilter, []> = {
  name: 'IS_ENTITY_OWNER',
  description: 'Allow entities owned by the current user',
  apply: ({ resource, user }) => {
    if (!resource.relations || !user) {
      return false;
    }

    const claims = getIdentityClaims(user);

    return resource.relations
      .filter(relation => relation.type === RELATION_OWNED_BY)
      .some(relation => claims.includes(stringifyEntityRef(relation.target)));
  },
  toQuery: ({ user }): EntitiesSearchFilter => ({
    key: 'spec.owner',
    values: user ? getIdentityClaims(user) : [],
  }),
};
