package org.graylog2.bootstrap.preflight.web.resources;

import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiParam;
import org.apache.shiro.authz.annotation.RequiresAuthentication;
import org.apache.shiro.authz.annotation.RequiresPermissions;
import org.graylog2.audit.jersey.NoAuditEvent;
import org.graylog2.bootstrap.preflight.web.resources.model.RemoteReindexRequest;
import org.graylog2.indexer.datanode.RemoteReindexingMigrationAdapter;
import org.graylog2.shared.security.RestPermissions;

import javax.inject.Inject;
import javax.validation.Valid;
import javax.validation.constraints.NotNull;
import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

@Path("/migration")
@RequiresAuthentication
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
@Api(value = "Migration", description = "Migrate data from existing cluster")
public class RemoteReindexResource {
    private final RemoteReindexingMigrationAdapter migrationService;

    @Inject
    public RemoteReindexResource(RemoteReindexingMigrationAdapter migrationService) {
        this.migrationService = migrationService;
    }

    @POST
    @Path("/remoteReindex")
    @NoAuditEvent("No Audit Event needed")
    @RequiresPermissions(RestPermissions.DATANODE_MIGRATION)
    @ApiOperation(value = "by remote reindexing", notes = "configure the host/credentials you want to use to migrate data from")
    public void migrate(@ApiParam(name = "remote configuration") @NotNull @Valid RemoteReindexRequest request) {
        migrationService.start(request.hostname(), request.user(), request.password(), request.indices());
    }

    @GET
    @Path("/remoteReindex")
    @NoAuditEvent("No Audit Event needed")
    @RequiresPermissions(RestPermissions.DATANODE_MIGRATION)
    @ApiOperation(value = "status", notes = "status for a running migration")
    public RemoteReindexingMigrationAdapter.Status status() {
        return migrationService.status();
    }

}
