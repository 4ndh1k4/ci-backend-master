  <!-- Content Header (Page header) -->
    <section class="content-header">
      <h1>
        <?php echo lang('index_heading');?>
        <small><?php echo lang('index_subheading');?></small>
      </h1>
      <ol class="breadcrumb">
        <li><?php echo anchor('dashboard','<i class="fa fa-dashboard"></i> Beranda</a>')?></li>
      </ol>
    </section>
  <!-- Main content -->
    <section class="content">
	<?php if(isset($message)){   
		 echo '<div class="alert alert-warning">  
		   <a href="#" class="close" data-dismiss="alert">&times;</a>  
		   '.$message.'
		 </div> '; 
    }  ?>
      <!-- Default box -->
      <div class="box">
        <div class="box-header">
		 <h3 class="box-title"></h3><hr />	
			<div class="box-tools pull-right">
				<?php echo anchor('auth/create_user', lang('index_create_user_link'),array('class'=>'btn btn-flat btn-primary'))?>  <?php echo anchor('auth/create_group', lang('index_create_group_link'),array('class'=>'btn btn-flat btn-default'))?>
            </div>
		</div>
            <div class="box-body" >
				<table class="table table-bordered table-striped" id="myTable" width=100%>
					<thead>
						<tr>
							<th><?php echo lang('index_fname_th');?></th>
							<th><?php echo lang('index_lname_th');?></th>
							<th><?php echo lang('index_email_th');?></th>
							<th><?php echo lang('index_groups_th');?></th>
							<th><?php echo lang('index_status_th');?></th>
							<th><?php echo lang('index_action_th');?></th>
						</tr>
					</thead>
					<tbody>
						<?php foreach ($users as $user):?>
							<tr>
								<td><?php echo htmlspecialchars($user->first_name,ENT_QUOTES,'UTF-8');?></td>
								<td><?php echo htmlspecialchars($user->last_name,ENT_QUOTES,'UTF-8');?></td>
								<td><?php echo htmlspecialchars($user->email,ENT_QUOTES,'UTF-8');?></td>
								<td>
									<?php foreach ($user->groups as $group):?>
										<?php echo anchor("auth/edit_group/".$group->id, htmlspecialchars($group->name,ENT_QUOTES,'UTF-8')) ;?><br />
									<?php endforeach?>
								</td>
								<td><?php echo ($user->active) ? anchor("auth/deactivate/".$user->id, lang('index_active_link')) : anchor("auth/activate/". $user->id, lang('index_inactive_link'));?></td>
								<td><?php echo anchor("auth/edit_user/".$user->id, '<i class="fa fa-edit"></i> Ubah data' ,array('class' =>'btn btn-flat btn-info')) ;?></td>
							</tr>
						<?php endforeach;?>
					</tbody>
				</table>        
			</div>       
    </section>
   <!-- /.content -->
  </div>
<script src="<?php echo base_url('resources/js/jquery-1.11.2.min.js') ?>"></script>  
<script>
  $(document).ready( function () {
 		$('#myTable').DataTable({
        "scrollX": true
    });
  } );
</script>