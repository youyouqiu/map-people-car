/**
 * 用户信息
 */
export interface IUserInfo {
    administrativeOffice: string;
    authorizationDate: any;
    duty: string;
    editable?: number | string;
    gender: string;
    id: number | string;
    identity: string;
    industryId: number | string;
    isActive: number | string;
    mail: string;
    mobile: string;
    organizationId: number | string;
    organizationName: string;
    password: string;
    realName: string;
    username: string;
    userGroupDtos?: IUserGroupDtos[];
    userRoleDtos?: IUserRoleDtos[];
    [type: string]: any;
}

/**
 * 角色信息
 */
export interface IUserRoleDtos {
    createDataTime?: string;
    roleId?: string;
    roleName?: string;
    userId?: string;
    priority?: number;
}

/**
 * 分组信息
 */
export interface IUserGroupDtos {
    createDataTime?: string;
    groupId?: string;
    groupName?: string;
    userId?: string;
    orgId?: string;
    orgName?: string;
}

/**
 * 角色信息
 */
export interface IRoles {
    "code"?: string;
    "createDataTime"?: string;
    "createDataUsername"?: string;
    "description": string;
    "editable"?: number;
    "id": string;
    "name": string;
    "priority"?: number;
    "updateDataTime"?: string;
    "updateDataUsername"?: string;
}