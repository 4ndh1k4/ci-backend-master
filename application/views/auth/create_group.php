
    <!-- Content Header (Page header) -->
    <section class="content-header">
      <h1>
        <?php echo lang('create_group_heading');?>
        <small><?php echo lang('create_group_subheading');?></small>
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
		 <h3 class="box-title"></h3>
		<hr />	 
			<?php echo form_open("auth/create_group");?>
				  <div class = "form-group">
						<label><?php echo lang('create_group_name_label', 'group_name');?></label>
						<?php echo form_input($group_name);?>
				  </div>

				  <div class = "form-group">
						<label><?php echo lang('create_group_desc_label', 'description');?></label>
						<?php echo form_input($description);?>
				  </div>

				  <?php echo form_submit('submit', lang('create_group_submit_btn'),array('class'=>'btn btn-primary btn-flat'));?>

				<a href="<?php echo site_url('auth/index') ?>" class="btn btn-flat btn-default">Batal</a>
			<?php echo form_close();?>
		</div>
		</div>
               
    </section>
	<!-- /.content -->
    

